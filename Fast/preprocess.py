import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

# Load dataset
df = pd.read_csv("dataset.csv")

# Features (IMU data) and Labels (GRF values)
X = df[['Acc_X', 'Acc_Y', 'Acc_Z', 'Gyro_X', 'Gyro_Y', 'Gyro_Z']]
y = df[['GRF_V', 'GRF_AP', 'GRF_ML']]

# Normalize the data
scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()

X_scaled = scaler_X.fit_transform(X)
y_scaled = scaler_y.fit_transform(y)

# Save the scalers
joblib.dump(scaler_X, "scaler_X.pkl")
joblib.dump(scaler_y, "scaler_y.pkl")

# Save processed data
np.save("X_scaled.npy", X_scaled)
np.save("y_scaled.npy", y_scaled)
