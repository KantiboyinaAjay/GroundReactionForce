import tensorflow as tf
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os

base_dir = os.path.dirname(__file__)  # Get script's directory
file_path = os.path.join(base_dir, "..", "models", "train_imu_grf.csv")
data = pd.read_csv(file_path)

X = data[["Acc_X", "Acc_Y", "Acc_Z", "Gyro_X", "Gyro_Y", "Gyro_Z"]]
y = data[["GRF_V", "GRF_AP", "GRF_ML"]]

# Normalize data
scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()
X_scaled = scaler_X.fit_transform(X)
y_scaled = scaler_y.fit_transform(y)

def train():
    # Define an Optimized ANN Model
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(512, activation='relu', input_shape=(6,)),
        tf.keras.layers.BatchNormalization(),  # Stabilizes training
        tf.keras.layers.Dropout(0.1),

        tf.keras.layers.Dense(256, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.1),

        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.BatchNormalization(),

        tf.keras.layers.Dense(64, activation='relu'),

        tf.keras.layers.Dense(3, activation='linear')  # Predicts GRF_V, GRF_AP, GRF_ML
    ])

    # Compile Model with Optimized Learning Rate(more learning rate-faster convergence-m learns fast)
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001), loss=tf.keras.losses.MeanSquaredError(), metrics=['mae'])

    # Set Early Stopping (Prevents Overfitting)
    early_stop = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=100, restore_best_weights=True)

    # Save the Best Model Automatically
    checkpoint = tf.keras.callbacks.ModelCheckpoint("best_grf_model.h5", monitor="val_loss", save_best_only=True, mode="min")

    # Train Model Efficiently
    history = model.fit(X_scaled, y_scaled, epochs=10, batch_size=256, validation_split=0.2, callbacks=[early_stop, checkpoint])

    # Save Final Model
    model.save("final_grf_prediction_model.h5")
    #print("Optimized GRF prediction model trained and saved successfully!")