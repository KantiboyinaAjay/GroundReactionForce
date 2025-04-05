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
model_path = "E:/FinalProject/Angular_Grf/Fast/final_grf_prediction_model.h5"
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
