import numpy as np
import tensorflow as tf
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os
# from models.data_train import train

# Load dataset to fit scalers
base_dir = os.path.dirname(__file__)  # Get script's directory
file_path = os.path.join(base_dir, "..", "models", "train_imu_grf.csv")
data = pd.read_csv(file_path)

# Fit scalers
scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()

X_train = data[["Acc_X", "Acc_Y", "Acc_Z", "Gyro_X", "Gyro_Y", "Gyro_Z"]]
y_train = data[["GRF_V", "GRF_AP", "GRF_ML"]]

scaler_X.fit(X_train)
scaler_y.fit(y_train)

# Load trained ANN model
model_path = "../final_grf_prediction_model.h5"
model = tf.keras.models.load_model(model_path)

# train()
# Prediction function
def predict_grf(acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z):
    input_values = np.array([[float(acc_x), float(acc_y), float(acc_z), float(gyro_x), float(gyro_y), float(gyro_z)]])
    
    # Normalize inputs
    input_scaled = scaler_X.transform(input_values)
    
    # Predict GRF values
    predicted_scaled = model.predict(input_scaled)
    
    # Convert back to original scale
    predicted_grf = scaler_y.inverse_transform(predicted_scaled)
    
    return {
        "GRF_V": float(predicted_grf[0][0]),
        "GRF_AP": float(predicted_grf[0][1]),
        "GRF_ML": float(predicted_grf[0][2])
    }


def grf_feedback(v_grf, ap_grf, ml_grf):
    ideal_grf = {
        "v": (3.0, 4.5),  # Body weight multiples (e.g., 3x to 4.5x body weight)
        "ap": (-0.5, 0.5),  # Breaking and propulsion forces
        "ml": (-0.2, 0.2)    # Sideways force should be minimal
    }
    feedback= []
    injuries = []
    if v_grf < ideal_grf["v"][0]:   # Vertical GRF Feedback
        feedback.append("Vertical GRF is too low, reducing push-off efficiency.")
        injuries.append("Risk due to low vertical_grf: Weak push-off, Achilles strain, poor acceleration.")
    elif v_grf > ideal_grf["v"][1]:
        feedback.append("Excessive vertical GRF may increase impact stress.")
        injuries.append("Risk due to high vertical_grf: Stress fractures, shin splints, knee pain.")
    
    if ap_grf < ideal_grf["ap"][0]:  # Anteroposterior GRF Feedback
        feedback.append("High braking force detected, slowing down sprint speed.")
        injuries.append("Risk due to low anterioposterior_grf: Knee pain, hamstring strain, inefficient stride.")
    elif ap_grf > ideal_grf["ap"][1]:
        feedback.append("Excessive forward push may cause injuriestability.")
        injuries.append("Risk due to high anterioposterior_grf: Achilles tendon overload, improper force absorption.")
    
    if ml_grf < ideal_grf["ml"][0]:  # Mediolateral GRF Feedback
      feedback.append("Mediolateral GRF is too low, which may indicate poor lateral stability.")
      injuries.append("Risk due to low mediolateral GRF: Reduced balance, higher risk of ankle injuriestability, inefficient force distribution.")
    elif ml_grf > ideal_grf["ml"][1]:
      feedback.append("Excessive mediolateral GRF detected, indicating potential imbalance.")
      injuries.append("Risk due to high mediolateral GRF: Ankle sprain, hip misalignment, excessive lateral movement affecting sprint efficiency.")
    
    return {
        "feedback": feedback if feedback else ["GRF values are within an optimal range."],
        "injury_risks": injuries if injuries else ["No significant injury risks detected."]
    }

# print("\nFeedback:")
# for fb in result["feedback"]:
#     print("- " + fb)

# print("\nPotential Injury Risks:")
# for risk in result["injury_risks"]:
#     print("- " + risk)