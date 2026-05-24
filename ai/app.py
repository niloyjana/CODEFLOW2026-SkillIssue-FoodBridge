from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
import datetime

app = Flask(__name__)
CORS(app) # Allow CORS for frontend integration

MODEL_PATH = 'waste_model.pkl'

# Load model globally if it exists
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print(f"Loaded existing model from {MODEL_PATH}")
else:
    print(f"WARNING: Model {MODEL_PATH} not found. Please run train.py first.")

@app.route('/predict', methods=['POST'])
def predict_waste():
    global model
    if model is None:
        return jsonify({'error': 'Model not trained yet.'}), 503
        
    data = request.json
    
    try:
        # Extract features
        portions = float(data.get('portions', 0))
        seating_capacity = float(data.get('seatingCapacity', 0))
        meal_time = data.get('mealTime', 'lunch')
        venue_type = data.get('venueType', 'restaurant')
        
        # Simple heuristic to determine if today is weekend
        # Real implementation could use the exact date
        today = datetime.datetime.now().weekday()
        is_weekend = 1 if today >= 5 else 0
        
        # Create dataframe for prediction
        input_data = pd.DataFrame({
            'portions': [portions],
            'seatingCapacity': [seating_capacity],
            'mealTime': [meal_time],
            'venueType': [venue_type],
            'isWeekend': [is_weekend]
        })
        
        # Predict
        predicted_waste = model.predict(input_data)[0]
        
        # Ensure it's not negative
        predicted_waste = max(0.0, float(predicted_waste))
        
        return jsonify({
            'predictedWasteKg': round(predicted_waste, 2),
            'features': {
                'portions': portions,
                'seatingCapacity': seating_capacity,
                'mealTime': meal_time,
                'venueType': venue_type,
                'isWeekend': is_weekend
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
