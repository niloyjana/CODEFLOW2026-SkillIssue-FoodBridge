import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# Generate synthetic dataset for training
def create_synthetic_data(n_samples=1000):
    np.random.seed(42)
    
    # Features
    portions = np.random.randint(10, 500, n_samples)
    seating_capacity = np.random.randint(20, 200, n_samples)
    
    meal_times = ['breakfast', 'lunch', 'dinner']
    meal_time = np.random.choice(meal_times, n_samples)
    
    venue_types = ['cafe', 'restaurant', 'fastfood']
    venue_type = np.random.choice(venue_types, n_samples)
    
    # Is it a weekend?
    is_weekend = np.random.choice([0, 1], n_samples, p=[0.71, 0.29])
    
    # Target: Waste in Kg (Synthetic relationship)
    # Base waste is 2% of portions + some noise
    waste_kg = portions * 0.02 + np.random.normal(0, 1.5, n_samples)
    
    # Restaurants have slightly more waste
    waste_kg = np.where(venue_type == 'restaurant', waste_kg * 1.3, waste_kg)
    # Dinner has more waste
    waste_kg = np.where(meal_time == 'dinner', waste_kg * 1.5, waste_kg)
    # Weekends have more waste
    waste_kg = np.where(is_weekend == 1, waste_kg * 1.4, waste_kg)
    
    # Ensure no negative waste
    waste_kg = np.maximum(waste_kg, 0)
    
    df = pd.DataFrame({
        'portions': portions,
        'seatingCapacity': seating_capacity,
        'mealTime': meal_time,
        'venueType': venue_type,
        'isWeekend': is_weekend,
        'wasteKg': waste_kg
    })
    return df

def train_model():
    print("Generating synthetic data...")
    df = create_synthetic_data(2000)
    
    X = df[['portions', 'seatingCapacity', 'mealTime', 'venueType', 'isWeekend']]
    y = df['wasteKg']
    
    # Preprocessing pipeline
    categorical_features = ['mealTime', 'venueType']
    numeric_features = ['portions', 'seatingCapacity', 'isWeekend']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', 'passthrough', numeric_features)
        ])
    
    # Random Forest Pipeline
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    print("Training Random Forest Regressor...")
    model.fit(X, y)
    
    # Save the model
    joblib.dump(model, 'waste_model.pkl')
    print("Model saved to waste_model.pkl")

if __name__ == '__main__':
    train_model()
