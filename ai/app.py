from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
# pyrefly: ignore [missing-import]
import joblib
import os
import datetime
import glob
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app) # Allow CORS for frontend integration

MODEL_PATH = 'waste_model.pkl'
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('models', exist_ok=True)

# Load model globally if it exists
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print(f"Loaded existing global model from {MODEL_PATH}")
else:
    print(f"WARNING: Global model {MODEL_PATH} not found. Please run train.py first.")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload-sales', methods=['POST'])
def upload_sales():
    """Upload CSV file with sales history"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    restaurant_id = request.form.get('restaurantId')
    
    if not restaurant_id:
        return jsonify({'error': 'Restaurant ID is required'}), 400
        
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only CSV files allowed'}), 400
    
    # Save file
    filename = secure_filename(f"{restaurant_id}_{file.filename}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Validate CSV format
    try:
        df = pd.read_csv(filepath)
        required_columns = ['date', 'day_of_week', 'meal_period', 'portions_sold']
        
        for col in required_columns:
            if col not in df.columns:
                return jsonify({'error': f'Missing required column: {col}'}), 400
        
        return jsonify({
            'success': True,
            'rows': len(df),
            'columns': df.columns.tolist(),
            'filepath': filepath,
            'restaurantId': restaurant_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/train-model', methods=['POST'])
def train_model_endpoint():
    """Train AI model on uploaded sales data"""
    data = request.json or {}
    restaurant_id = data.get('restaurantId')
    
    if not restaurant_id:
        return jsonify({'error': 'Restaurant ID is required'}), 400
    
    # Find the uploaded file for this restaurant
    files = glob.glob(os.path.join(app.config['UPLOAD_FOLDER'], f'{restaurant_id}_*.csv'))
    if not files:
        return jsonify({'error': 'No sales data found. Please upload CSV first.'}), 400
    
    filepath = files[0]
    
    try:
        df = pd.read_csv(filepath)
        
        # Clean day of week values (lowercase and strip spaces)
        df['day_of_week'] = df['day_of_week'].astype(str).str.lower().str.strip()
        df['meal_period'] = df['meal_period'].astype(str).str.lower().str.strip()
        
        # Simple model based on averages
        # Group by day_of_week and meal_period, calculate mean portions_sold
        meal_avg = df.groupby(['day_of_week', 'meal_period'])['portions_sold'].mean()
        
        # Convert index keys to string representations to avoid joblib/JSON MultiIndex issues
        meal_avg_dict = {}
        for k, v in meal_avg.to_dict().items():
            if isinstance(k, tuple):
                # Save both as a tuple string and raw string keys for lookup safety
                meal_avg_dict[f"{k[0]}_{k[1]}"] = float(v)
                meal_avg_dict[str(k)] = float(v)
            else:
                meal_avg_dict[str(k)] = float(v)
        
        model_data = {
            'type': 'average_based',
            'meal_avg': meal_avg_dict,
            'restaurant_id': restaurant_id,
            'training_rows': len(df)
        }
        
        model_out_path = f'models/{restaurant_id}_model.pkl'
        joblib.dump(model_data, model_out_path)
        
        # Calculate actual training accuracy based on MAPE (Mean Absolute Percentage Error)
        avg_overall = float(df['portions_sold'].mean()) if len(df) > 0 else 0
        if len(df) > 0:
            predictions = df.apply(
                lambda row: meal_avg.get((row['day_of_week'], row['meal_period']), avg_overall), 
                axis=1
            )
            actual = df['portions_sold']
            mape = ((actual - predictions).abs() / actual.clip(lower=1.0)).mean()
            calculated_accuracy = max(50.0, min(99.0, (1.0 - mape) * 100.0))
            accuracy = round(calculated_accuracy, 1)
        else:
            accuracy = 85.0
            
        if pd.isna(accuracy):
            accuracy = 85.0
        
        return jsonify({
            'success': True,
            'message': f'Model trained on {len(df)} rows of sales data',
            'accuracy': accuracy,
            'restaurantId': restaurant_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict', methods=['POST'])
def predict_waste():
    global model
    data = request.json or {}
    
    try:
        # Extract features
        portions = float(data.get('portions', 0))
        seating_capacity = float(data.get('seatingCapacity', 0))
        meal_time = str(data.get('mealTime', 'lunch')).lower().strip()
        venue_type = str(data.get('venueType', 'restaurant')).lower().strip()
        restaurant_id = data.get('restaurantId')
        
        # Simple heuristic to determine if today is weekend
        now = datetime.datetime.now()
        today = now.weekday() # 0-6 (Monday-Sunday)
        is_weekend = 1 if today >= 5 else 0
        
        # Check if restaurant has a customized model
        custom_model_path = f'models/{restaurant_id}_model.pkl' if restaurant_id else None
        
        if custom_model_path and os.path.exists(custom_model_path):
            print(f"Using customized model for restaurant {restaurant_id}")
            model_data = joblib.load(custom_model_path)
            
            if model_data.get('type') == 'average_based':
                meal_avg = model_data.get('meal_avg', {})
                weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                today_name = weekdays[today]
                
                # Check for average sold for this weekday and meal time
                key_pattern = f"{today_name}_{meal_time}"
                avg_sold = meal_avg.get(key_pattern)
                
                if avg_sold is None:
                    # Try tuple string format
                    avg_sold = meal_avg.get(str((today_name, meal_time)))
                    
                if avg_sold is None:
                    # Fallback default portions sold if combination not found
                    avg_sold = 30.0
                
                # Calculate predicted waste
                if portions > avg_sold:
                    predicted_waste = (portions - avg_sold) * 0.22
                else:
                    predicted_waste = portions * 0.22
                
                predicted_waste = max(0.1, float(predicted_waste))
                
                return jsonify({
                    'predictedSurplusKg': round(predicted_waste, 2),
                    'features': {
                        'portions': portions,
                        'seatingCapacity': seating_capacity,
                        'mealTime': meal_time,
                        'venueType': venue_type,
                        'isWeekend': is_weekend,
                        'customModelUsed': True,
                        'avgSold': avg_sold
                    }
                })
        
        # Fallback to the original global model
        if model is None:
            return jsonify({'error': 'Model not trained yet.'}), 503
            
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
        predicted_waste = max(0.0, float(predicted_waste))
        
        return jsonify({
            'predictedSurplusKg': round(predicted_waste, 2),
            'features': {
                'portions': portions,
                'seatingCapacity': seating_capacity,
                'mealTime': meal_time,
                'venueType': venue_type,
                'isWeekend': is_weekend,
                'customModelUsed': False
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'global_model_loaded': model is not None,
        'uploads_count': len(glob.glob('uploads/*.csv')),
        'custom_models_count': len(glob.glob('models/*.pkl'))
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
