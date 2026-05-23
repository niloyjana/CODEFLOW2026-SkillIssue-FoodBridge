import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import pickle

print("Loading training data...")
df = pd.read_csv('synthetic_data.csv')

print("Encoding categorical variables...")

le_day = LabelEncoder()
le_meal = LabelEncoder()
le_venue = LabelEncoder()

df['day_encoded'] = le_day.fit_transform(df['day_of_week'])
df['meal_encoded'] = le_meal.fit_transform(df['meal_time'])
df['venue_encoded'] = le_venue.fit_transform(df['venue_type'])

features = [
    'day_encoded',
    'meal_encoded',
    'venue_encoded',
    'seating_capacity',
    'portions'
]

X = df[features]
y = df['actual_waste_kg']

print(f"Training model on {len(X)} samples...")

model = RandomForestRegressor(
    n_estimators=50,
    random_state=42
)

model.fit(X, y)

print("Saving model and encoders...")

pickle.dump(model, open('model.pkl', 'wb'))
pickle.dump(le_day, open('le_day.pkl', 'wb'))
pickle.dump(le_meal, open('le_meal.pkl', 'wb'))
pickle.dump(le_venue, open('le_venue.pkl', 'wb'))

print("Model trained and saved!")
print(f"Accuracy: {model.score(X, y):.3f}")