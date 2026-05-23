import requests
import json

url = 'http://localhost:5001/predict'

test_cases = [
    {
        'name': 'Saturday dinner at restaurant',
        'data': {
            'dayOfWeek': 'saturday',
            'mealTime': 'dinner',
            'venueType': 'restaurant',
            'seatingCapacity': 80,
            'portions': 45
        }
    },
    {
        'name': 'Monday lunch at cafe',
        'data': {
            'dayOfWeek': 'monday',
            'mealTime': 'lunch',
            'venueType': 'cafe',
            'seatingCapacity': 30,
            'portions': 20
        }
    },
    {
        'name': 'Wednesday breakfast at fastfood',
        'data': {
            'dayOfWeek': 'wednesday',
            'mealTime': 'breakfast',
            'venueType': 'fastfood',
            'seatingCapacity': 50,
            'portions': 60
        }
    }
]

print("Testing API...\n")

for test in test_cases:
    print(f"Testing: {test['name']}")
    print(f"Input: {json.dumps(test['data'], indent=2)}")

    response = requests.post(url, json=test['data'])

    print(f"Output: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)