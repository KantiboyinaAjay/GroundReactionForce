from flask import Flask, request, jsonify
import os
import json

import pyrebase
import firebase_admin
from firebase_admin import auth as auth_admin, credentials

from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__)
load_dotenv()

firebase_config = os.getenv('FIREBASE_CONFIG')
firebase = pyrebase.initialize_app(json.loads(firebase_config))
cred = credentials.Certificate(r"./grf-project-b6824-firebase-adminsdk-fbsvc-f0b65cb42c.json")
firebase_admin.initialize_app(cred)
auth = firebase.auth()

CORS(app, supports_credentials=True)

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
        return jsonify({"message": "Login successful"})
    except:
        return jsonify({"error": "Invalid credentials"})


@app.route('/register' , methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth.create_user_with_email_and_password(email , password)
        return "<h1>register successfull</h1>"
    except:
        return "unable to register now"

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
        user_uid = decoded_token['uid']
        email = decoded_token['email']

        return jsonify({"message": "User authenticated", "uid": user_uid, "email": email})
    except Exception as e:
        return jsonify({"error": str(e)}), 401
    
@app.route('/auth/github', methods=['POST'])
def github_auth():
    try:
        id_token = request.json.get('idToken')
        decoded_token = auth_admin.verify_id_token(id_token)
        user_uid = decoded_token['uid']
        email = decoded_token['email']

        return jsonify({"message": "User authenticated", "uid": user_uid, "email": email})
    except Exception as e:
        return jsonify({"error": str(e)}), 401
if __name__ == '__main__':
    app.run(debug=True)
