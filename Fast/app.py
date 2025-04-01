#imports
from flask import Flask, request, jsonify,session
import os
import json

import pyrebase
import firebase_admin
from firebase_admin import auth as auth_admin, credentials , firestore

from dotenv import load_dotenv
from flask_cors import CORS

from flask_pymongo import PyMongo
from flask_marshmallow import Marshmallow
from marshmallow import fields, ValidationError
#create the Flask instance
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
load_dotenv()

app.config["MONGO_URI"] = "mongodb+srv://ajaykantiboyina:Ajay%406203@cluster0.vleuyp5.mongodb.net/Prediction"
mongo = PyMongo(app)
ma = Marshmallow(app)
#  Define Schema Using Marshmallow
class PredictionSchema(ma.Schema):
    input1 = fields.Float(required=True)
    input2 = fields.Float(required=True)
    input3 = fields.Float(required=True)
    prediction = fields.Float(required=True)

prediction_schema = PredictionSchema()

# firebase auth declarations
firebase_config = os.getenv('FIREBASE_CONFIG')
firebase = pyrebase.initialize_app(json.loads(firebase_config))

cred = credentials.Certificate("./grf-project-b6824-firebase-adminsdk-fbsvc-ac4cc9e271.json")
firebase_admin.initialize_app(cred)
auth = firebase.auth()
fire_db = firestore.client()

CORS(app, supports_credentials=True)

#routes
@app.route('/' , methods=['POST'])
def home():
    return 12

@app.route('/login' , methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth.sign_in_with_email_and_password(email , password)

        decoded_token = auth_admin.verify_id_token(user.get('idToken'))
        email = decoded_token['email'].split("@")
        name = email[0]

        session['uid'] = decoded_token['uid']
        session['name'] = name
        
        return jsonify(decoded_token)
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        return jsonify({"error": str(e)}), 401

@app.route('/register' , methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth.create_user_with_email_and_password(email , password)

        decoded_token = auth_admin.verify_id_token(user.get('idToken'))
        # email = decoded_token['email'].split("@")
        # name = email[0]

        # session['uid'] = decoded_token['uid']
        # session['name'] = name
        
        return jsonify(decoded_token)
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        return jsonify({"error": str(e)}), 401

@app.route('/forgot' , methods=['POST'])
def forgot():
    data = request.json
    email = data.get('email')
    try:
        user = auth.send_password_reset_email(email)
        return user
    except:
        return "unable to sent mail now"
    
@app.route('/auth/google', methods=['POST'])
def google_auth():
    try:
        id_token = request.json.get('idToken')
        decoded_token = auth_admin.verify_id_token(id_token)
        email = decoded_token['email'].split("@")
        name = email[0]
        session['uid'] = decoded_token['uid']
        session['name'] = name
        return jsonify(decoded_token)
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        return jsonify({"error": str(e)}), 401
    
@app.route('/auth/github', methods=['POST'])
def github_auth():
    try:
        id_token = request.json.get('idToken')
        decoded_token = auth_admin.verify_id_token(id_token)
        email = decoded_token['email'].split("@")
        name = email[0]
        session['uid'] = decoded_token['uid']
        session['name'] = name
        return jsonify(decoded_token)
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        return jsonify({"error": str(e)}), 401

@app.route('/predict', methods=['POST'])
def prediction():
    data = request.json
    a1 = float(data.get('a1'))
    a2 = float(data.get('a2'))
    a3 = float(data.get('a3'))
    v1 = float(data.get('v1'))
    v2 = float(data.get('v2'))
    v3 = float(data.get('v3'))
    grfx = float(data.get('grfx'))
    grfy = float(data.get('grfy'))
    grfz = float(data.get('grfz'))
    uid = data.get('uid')
    return store_prediction(uid , a1 , a2 , a3 , v1 , v2 , v3 , grfx , grfy , grfz)

def store_prediction(uid, a1 , a2 , a3 , v1 , v2 , v3 , grfx , grfy , grfz):
    try:
        entry = {"a1": a1, "a2": a2, "a": a3, "v1":v1 , "v2":v2 , "v3":v3 , "grfx": grfx , "grfy":grfy , "grfz":grfz}
        mongo.db.Predictions.update_one(
            {"_id": uid},
            {"$push": {"entries": entry}},
            upsert=True
        )
        return jsonify({"message": "Data stored successfully"}), 201
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

@app.route('/get_predictions', methods=['GET'])
def retrieve_predictions():
    data = request.json
    uid = data.get('uid')
    user_data = mongo.db.Predictions.find_one({"_id": uid})
    return jsonify(user_data if user_data else {"error": "No data found"})


@app.route('/get_session', methods=['GET'])
def get_session():
    if 'uid' in session and 'name' in session:
        return jsonify({"uid": session['uid'], "name": session['name']}), 200
    return jsonify({"error": "No session found"}), 401

if __name__ == '__main__':
    app.run(debug=True)

