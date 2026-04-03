# quantum_model.py
# Updated for Qiskit 1.0+ compatibility

import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import joblib
import os

# Qiskit 1.0+ Imports
from qiskit.primitives import StatevectorSampler as Sampler
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit_algorithms.optimizers import COBYLA
from qiskit_machine_learning.algorithms.classifiers import VQC
from qiskit_machine_learning.utils.loss_functions import CrossEntropyLoss

MODEL_FILENAME = "vqc_stock_weights.joblib" 
SCALER_FILENAME = "data_scaler.joblib"

class QuantumStockPredictor:
    """
    A class to handle the entire lifecycle of the VQC stock prediction model.
    """
    def __init__(self, ticker="^FTSE", features=2, train_period_years=5):
        self.ticker = ticker
        self.features = features
        self.train_period_years = train_period_years
        self.vqc = None
        self.scaler = None
        self.data = None

    def _fetch_data(self):
        """Fetches historical stock data from Yahoo Finance."""
        print(f"Fetching {self.train_period_years} years of data for {self.ticker}...")
        end_date = pd.Timestamp.now()
        start_date = end_date - pd.DateOffset(years=self.train_period_years)
        
        # Added auto_adjust=True to handle recent yfinance format changes
        self.data = yf.download(self.ticker, start=start_date, end=end_date, auto_adjust=True)
        
        if self.data.empty:
            raise ValueError(f"No data fetched for ticker {self.ticker}. Check the ticker symbol.")
        print("Data fetched successfully.")

    def _engineer_features(self):
        """Calculates technical indicators to be used as features."""
        print("Engineering features (RSI, SMA)...")
        # Ensure we handle the data as a Series to avoid MultiIndex issues
        close_prices = self.data['Close']
        
        self.data['SMA'] = close_prices.rolling(window=14).mean()
        delta = close_prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        self.data['RSI'] = 100 - (100 / (1 + rs))
        
        # Target: 1 if next day price is higher than today
        self.data['Target'] = (close_prices.shift(-1) > close_prices).astype(int)
        self.data.dropna(inplace=True)
        print("Features engineered.")

    def _prepare_data_for_vqc(self):
        """Prepares the final feature set and scales it for the VQC."""
        print("Preparing and scaling data...")
        X = self.data[['SMA', 'RSI']].values
        y = self.data['Target'].values
        self.scaler = MinMaxScaler()
        X_scaled = self.scaler.fit_transform(X)
        joblib.dump(self.scaler, SCALER_FILENAME)
        print(f"Scaler saved to {SCALER_FILENAME}")
        return X_scaled, y

    def _build_vqc_instance(self, initial_weights=None):
        """Helper function to create a VQC instance compatible with Qiskit 1.0."""
        sampler = Sampler()
        feature_map = ZZFeatureMap(feature_dimension=self.features, reps=2)
        ansatz = RealAmplitudes(num_qubits=self.features, reps=3)
        optimizer = COBYLA(maxiter=100)
        
        vqc_instance = VQC(
            sampler=sampler,
            feature_map=feature_map,
            ansatz=ansatz,
            optimizer=optimizer,
            initial_point=initial_weights,
            loss=CrossEntropyLoss()
        )
        return vqc_instance

    def train_model(self):
        """Trains the VQC model and saves its weights to a file."""
        self._fetch_data()
        self._engineer_features()
        X, y = self._prepare_data_for_vqc()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print("Configuring and initializing VQC for training...")
        self.vqc = self._build_vqc_instance() 

        print("Training VQC... This may take several minutes.")
        self.vqc.fit(X_train, y_train)
        
        score = self.vqc.score(X_test, y_test)
        print(f"Model accuracy on test data: {score:.2f}")

        # In Qiskit 1.0 ML, weights are stored in the results
        joblib.dump(self.vqc.weights, MODEL_FILENAME)
        print(f"Trained model weights saved to {MODEL_FILENAME}")

    def load_model(self):
        """Loads a pre-trained model by rebuilding it with its saved weights."""
        print("Loading pre-trained model...")
        if not os.path.exists(MODEL_FILENAME) or not os.path.exists(SCALER_FILENAME):
            print("Model weights or scaler file not found. Please train the model first.")
            return False
        
        print("Loading saved weights and scaler...")
        loaded_weights = joblib.load(MODEL_FILENAME)
        self.scaler = joblib.load(SCALER_FILENAME)
        
        print("Rebuilding VQC structure...")
        self.vqc = self._build_vqc_instance(initial_weights=loaded_weights)
        
        # Fix: VQC requires an internal result state to allow calling .predict()
        # We simulate the result object that .fit() would usually produce.
        class MockResult:
            def __init__(self, x): self.x = x
        self.vqc._fit_result = MockResult(loaded_weights)
        
        print("Model and scaler loaded successfully.")
        return True

    def predict(self, ticker):
        """Makes a prediction for a given ticker using the loaded model."""
        if self.vqc is None or self.scaler is None:
            raise Exception("Model is not loaded. Please load or train the model first.")

        print(f"Fetching latest data for {ticker}...")
        data_pred = yf.download(ticker, period="60d", interval="1d", auto_adjust=True)
        if data_pred.empty:
            raise ValueError(f"Could not fetch prediction data for {ticker}.")

        # Feature calculation
        close_prices = data_pred['Close']
        data_pred['SMA'] = close_prices.rolling(window=14).mean()
        delta = close_prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        data_pred['RSI'] = 100 - (100 / (1 + rs))
        
        latest_features = data_pred[['SMA', 'RSI']].iloc[-1:].values
        
        if np.isnan(latest_features).any():
             raise ValueError("Insufficient recent data to calculate technical indicators.")

        scaled_features = self.scaler.transform(latest_features)

        print("Making quantum prediction...")
        # Use predict_proba for confidence metrics
        prediction_raw = self.vqc.predict_proba(scaled_features)
        
        prediction = np.argmax(prediction_raw)
        confidence = np.max(prediction_raw) * 100

        direction = "UP" if prediction == 1 else "DOWN"
        
        print(f"Prediction: {direction}, Confidence: {confidence:.2f}%")
        return {
            "direction": direction,
            "confidence": f"{confidence:.2f}"
        }

if __name__ == '__main__':
    predictor = QuantumStockPredictor(ticker="^FTSE")
    print("Starting initial model training...")
    predictor.train_model()