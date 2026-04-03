from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
import yfinance as yf 
import pandas as pd
import numpy as np
import torch
from transformers import pipeline

# Import your working quantum model
from quantum_model import QuantumStockPredictor

# --- Configuration ---
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
CORS(app)

# NewsAPI Key for Fallback (Keep this active)
NEWS_API_KEY = "3662937f2c884b93b977a90cbf4ef51f"

# --- AI Sentinel: FinBERT Initialization ---
logging.info("Initializing FinBERT Sentiment Analysis Pipeline...")
sentiment_pipeline = pipeline(
    "sentiment-analysis", 
    model="ProsusAI/finbert", 
    top_k=None,
    device=-1 # Use CPU for stability
) 

def get_news_sentiment(ticker):
    """
    Fetches news from yfinance with a NewsAPI fallback for 100% reliability.
    """
    try:
        headlines = []
        
        # 1. Try Yahoo Finance first (Most accurate for stocks)
        try:
            stock_obj = yf.Ticker(ticker)
            yf_news = stock_obj.news
            if yf_news:
                headlines = [article['title'] for article in yf_news[:5]]
        except Exception as e:
            logging.warning(f"yfinance fetch failed: {e}")

        # 2. Fallback to NewsAPI if yfinance is empty or fails
        if not headlines:
            logging.info(f"Using NewsAPI fallback for {ticker}")
            clean_name = ticker.split('.')[0].replace('^', '')
            # We add 'stock' to the search to keep it relevant
            url = f"https://newsapi.org/v2/everything?q={clean_name}+stock&sortBy=relevancy&pageSize=5&apiKey={NEWS_API_KEY}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                headlines = [a['title'] for a in data.get('articles', [])]

        # 3. Final Check: If absolutely no news found
        if not headlines:
            return {"sentiment": "Neutral", "score": 0.0, "headlines": ["No recent news found for this ticker."]}

        # 4. Process with FinBERT
        raw_results = sentiment_pipeline(headlines)
        total_score = 0
        pos_count = 0
        neg_count = 0
        
        for result in raw_results:
            scores = {item['label']: item['score'] for item in result}
            # Professional Score: P(pos) - P(neg)
            total_score += (scores.get('positive', 0) - scores.get('negative', 0))
            
            top_label = max(scores, key=scores.get)
            if top_label == 'positive': pos_count += 1
            elif top_label == 'negative': neg_count += 1

        avg_score = total_score / len(headlines)
        mood = "Positive" if pos_count > neg_count else ("Negative" if neg_count > pos_count else "Neutral")

        return {
            "sentiment": mood,
            "score": float(round(avg_score, 4)),
            "headlines": headlines
        }

    except Exception as e:
        logging.error(f"News Analysis Error: {e}")
        return {"sentiment": "Neutral", "score": 0.0, "headlines": ["News service temporarily down."]}

# --- Quantum Model Initialization ---
predictor = QuantumStockPredictor()
state = {"model_loaded": predictor.load_model()}

# --- API Endpoints ---

@app.route('/predict', methods=['GET'])
def predict():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker required"}), 400

    try:
        if not state["model_loaded"]:
            state["model_loaded"] = predictor.load_model()

        # 1. Quantum Prediction (Logic inside quantum_model.py)
        quantum_prediction = predictor.predict(ticker)
        
        # 2. AI Sentinel News (Hybrid Logic)
        news_analysis = get_news_sentiment(ticker)
        
        return jsonify({
            "ticker": ticker,
            "quantumPrediction": quantum_prediction,
            "newsAnalysis": news_analysis
        })
    except Exception as e:
        logging.error(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/chart/<path:ticker>', methods=['GET'])
def get_chart_data(ticker):
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="6mo")
        if hist.empty:
            return jsonify({"error": "No data found"}), 404

        return jsonify({
            "labels": [d.strftime('%Y-%m-%d') for d in hist.index],
            "data": [float(v) for v in hist['Close'].values],
            "isPositive": bool(hist['Close'].iloc[-1] > hist['Close'].iloc[0])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)