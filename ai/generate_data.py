import pandas as pd
import random

print("Generating synthetic training data...")

data = []
days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
meal_times = ['breakfast', 'lunch', 'dinner']
venue_types = ['cafe', 'restaurant', 'fastfood']

for _ in range(500):
    day = random.choice(days)
    meal = random.choice(meal_times)
    venue = random.choice(venue_types)
    capacity = random.randint(10, 200)
    portions = random.randint(10, 100)

    waste = portions * 0.15

    if day in ['saturday', 'sunday']:
        waste += 3

    if meal == 'dinner':
        waste += 4
    elif meal == 'lunch':
        waste += 2

    if venue == 'restaurant':
        waste += 2
    elif venue == 'cafe':
        waste += 1

    waste += random.uniform(-2, 2)

    waste = max(1, round(waste, 1))

    data.append({
        'day_of_week': day,
        'meal_time': meal,
        'venue_type': venue,
        'seating_capacity': capacity,
        'portions': portions,
        'actual_waste_kg': waste
    })

df = pd.DataFrame(data)
df.to_csv('synthetic_data.csv', index=False)

print(f"Generated {len(df)} rows")
print("Saved synthetic_data.csv")