from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

print("Loading model and encoders...")

model = pickle.load(open('model.pkl', 'rb'))
le_day = pickle.load(open('le_day.pkl', 'rb'))
le_meal = pickle.load(open('le_meal.pkl', 'rb'))
le_venue = pickle.load(open('le_venue.pkl', 'rb'))

print("Ready to predict!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        required_fields = [
            'dayOfWeek',
            'mealTime',
            'venueType',
            'seatingCapacity',
            'portions'
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        day_encoded = le_day.transform([data['dayOfWeek'].lower()])[0]
        meal_encoded = le_meal.transform([data['mealTime'].lower()])[0]
        venue_encoded = le_venue.transform([data['venueType'].lower()])[0]

        features = np.array([[
            day_encoded,
            meal_encoded,
            venue_encoded,
            data['seatingCapacity'],
            data['portions']
        ]])

        prediction = model.predict(features)[0]

        confidence = 0.85 if prediction < 20 else 0.70
        confidence = min(0.95, max(0.60, confidence))

        return jsonify({
            'predictedKg': round(prediction, 1),
            'confidence': confidence
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'predictedKg': 5.0,
            'confidence': 0.5
        }), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True
    })

if __name__ == '__main__':
    print("Starting Flask API on http://localhost:5001")
    print("Endpoint: POST /predict")
    app.run(port=5001, debug=True)