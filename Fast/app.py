from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import os
import sys
import json
import math
import pyrebase
import firebase_admin
from firebase_admin import auth as auth_admin, credentials, firestore
from dotenv import load_dotenv
from pymongo import MongoClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models.data_predict import predict_grf, grf_feedback
from models.data_train import train

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mongo_client = MongoClient(os.getenv("DATABASEurl"))
db = mongo_client.Prediction

firebase_config = json.loads(os.getenv("FIREBASE_CONFIG"))
firebase = pyrebase.initialize_app(firebase_config)
cred = credentials.Certificate(r"./grf-project-b6824-firebase-adminsdk-fbsvc-ac4cc9e271.json")
firebase_admin.initialize_app(cred)
auth = firebase.auth()
fire_db = firestore.client()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str

class PredictionRequest(BaseModel):
    a1: str
    a2: str
    a3: str
    v1: str
    v2: str
    v3: str
    uid: str

train()
# Routes
@app.post("/login")
def login(data: LoginRequest):
    try:
        user = auth.sign_in_with_email_and_password(data.email, data.password)
        decoded_token = auth_admin.verify_id_token(user.get("idToken"))
        name = decoded_token['email'].split("@")[0]
        return {"name": name, "uid": decoded_token["uid"]}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/register")
def register(data: RegisterRequest):
    try:
        user = auth.create_user_with_email_and_password(data.email, data.password)
        decoded_token = auth_admin.verify_id_token(user.get("idToken"))
        name = decoded_token['email'].split("@")[0]
        return {"name": name, "uid": decoded_token["uid"]}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/forgot")
def forgot(data: Dict[str, str]):
    try:
        auth.send_password_reset_email(data["email"])
        return {"message": "Password reset email sent"}
    except:
        raise HTTPException(status_code=400, detail="Unable to send email")

@app.post("/auth/github")
async def github_auth(request: Request):
    try:
        body = await request.json()
        id_token = body["idToken"]
        decoded_token = auth_admin.verify_id_token(id_token)
        email = decoded_token['email'].split("@")
        name = email[0]
        return {"name": name, "uid": decoded_token["uid"]}
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/auth/google")
async def google_auth(request: Request):
    try:
        body = await request.json()
        id_token = body["idToken"]
        decoded_token = auth_admin.verify_id_token(id_token)
        email = decoded_token['email'].split("@")
        name = email[0]
        return {"name": name, "uid": decoded_token["uid"]}
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        raise HTTPException(status_code=401, detail=str(e))
    
@app.post("/predict")
async def prediction(data: PredictionRequest):
    prediction_result =  predict_grf(float(data.a1), float(data.a2), float(data.a3) , float(data.v1) , float(data.v2) , float(data.v3))
    
    grfx = prediction_result['GRF_V']
    grfy = prediction_result['GRF_AP']
    grfz = prediction_result['GRF_ML']
    
    store_feed = grf_feedback(grfx , grfy , grfz)
    feedback = store_feed['feedback']
    injuries = store_feed['injury_risks']

    # print(f"the feedback ==> {feedback} and the \n injuries ===> {injuries}")
    store_prediction(data.uid, float(data.a1), float(data.a2), float(data.a3), float(data.v1), float(data.v2), float(data.v3), grfx, grfy, grfz)
    return {"grfx": grfx, "grfy": grfy, "grfz": grfz , 'feedback': feedback, 'injuries': injuries}

def store_prediction(uid, a1, a2, a3, v1, v2, v3, grfx, grfy, grfz):
    entry = {"a1": a1, "a2": a2, "a3": a3, "v1": v1, "v2": v2, "v3": v3, "grfx": grfx, "grfy": grfy, "grfz": grfz}
    db.Predictions.update_one({"_id": uid}, {"$push": {"entries": entry}}, upsert=True)

@app.get("/get_predictions")
def retrieve_predictions(request: Request):
    page = int(request.query_params.get("page"))
    limit = int(request.query_params.get("limit"))
    uid = request.query_params.get("uid")
    document = db.Predictions.find_one({"_id": uid})
    if not document:
        raise HTTPException(status_code=404, detail="No data found")
    
    entries = document.get("entries", [])
    total = math.ceil(len(entries) / limit)
    start = (page - 1) * limit
    end = start + limit
    paginated_entries = entries[start:end]
    
    return {"start": start, "end": end, "total": total, "paginated_entries": paginated_entries, "entries": entries}
