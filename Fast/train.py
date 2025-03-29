import tensorflow as tf
import numpy as np

# Load preprocessed data
X_scaled = np.load("X_scaled.npy")
y_scaled = np.load("y_scaled.npy")

# Define the model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(X_scaled.shape[1],)),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(3)  # 3 output values for GRF_V, GRF_AP, GRF_ML
])

# Compile the model
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# Train the model
model.fit(X_scaled, y_scaled, epochs=50, batch_size=16, validation_split=0.2)

# Save the model
model.save("final_grf_prediction_model.h5")
