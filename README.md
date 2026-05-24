# FoodBridge 🍲

> Restaurants donate. Shelters receive. Individuals act. Waste stops.

FoodBridge is an AI-powered real-time food redistribution platform designed to reduce food waste and connect surplus food with people who need it. The platform combines machine learning, real-time synchronization, gamification, and open-source mapping to create a scalable and low-cost coordination system.

---

# 🚀 Problem Statement

Every day, restaurants and food businesses throw away large amounts of perfectly edible food while shelters and individuals struggle to access meals. Existing food rescue platforms mainly redistribute surplus food after waste already occurs.

FoodBridge solves this through:

* AI-powered food surplus prediction based on sales data of restaurants
* Real-time food redistribution
* Gamified community participation
* Zero-cost scalable architecture
* Smart coordination between restaurants, shelters, and individuals

---

# ✨ Features Implemented

## ✅ Authentication & User Roles

* Firebase Authentication integration
* Separate workflows for:

  * Restaurants
  * Shelters
  * Individuals
* Role-based dashboards and access

---

## ✅ Food Posting & Claim System

Restaurants can:

* Post surplus food listings
* Add food quantity and pickup details
* Track claimed donations

Shelters and individuals can:

* Browse nearby food listings
* Claim available food
* View pickup information

---

## ✅ AI Food Surplus Prediction

Custom machine learning model built using:

* Python
* Flask
* scikit-learn
* Random Forest Regression

### Prediction Features

The model predicts food waste using:

* Day of week
* Meal time
* Venue type
* Seating capacity
* Portions prepared

### AI Highlights

* 500 synthetic training samples
* ~85% confidence predictions
* Local inference under 100ms
* Zero API cost
* Fully offline-compatible model

---

# 🧠 AI Architecture

```text
Frontend (React)
      ↓
Flask API (/predict)
      ↓
Random Forest Model
      ↓
Prediction Response
```

Example Response:

```json
{
  "predictedKg": 8.5,
  "confidence": 0.85
}
```

---

# 🗺️ Real-Time Maps & Routing

Integrated fully free open-source mapping stack:

* OpenFreeMap → map rendering
* Nominatim → geocoding/search
* OSRM → route optimization

Features:

* Interactive maps
* Location-based listings
* Route visualization
* Distance-aware food discovery
* No paid APIs required

---

# 🏆 Gamification System

FoodBridge includes a dual leaderboard and reward system:

### Restaurants

* Ranked by kilograms of food saved
* Track completed donations

### Shelters

* Ranked by meals distributed
* Impact tracking

### Individuals

* Earn badges and pickup streaks
* Community contribution scoring

This increases long-term engagement and encourages regular participation.

---

# ⚡ Real-Time Synchronization

Built using Firebase Firestore.

Implemented:

* Real-time updates
* Live synchronization
* Optimistic locking
* Duplicate claim prevention
* Concurrent transaction handling

This prevents multiple users from claiming the same food simultaneously.

---

# 🛠️ Tech Stack

| Layer           | Technology         |
| --------------- | ------------------ |
| Frontend        | React + TypeScript |
| Backend         | Node.js + Express  |
| Database        | Firebase Firestore |
| Authentication  | Firebase Auth      |
| AI Runtime      | Python + Flask     |
| ML Library      | scikit-learn       |
| Data Processing | pandas + numpy     |
| Mapping         | OpenFreeMap        |
| Routing         | OSRM               |
| Geocoding       | Nominatim          |

---

# 📂 Project Architecture

```text
FoodBridge
│
├── web/                # React frontend
├── server/             # Express backend
├── ai/                 # Flask ML service
│   ├── app.py
│   ├── train.py
│   ├── generate_data.py
│   └── model.pkl
└── firebase/           # Firestore configuration
```

---

# 🔥 Why FoodBridge Stands Out

Unlike existing food rescue apps such as Too Good To Go, OLIO, and Flashfood, FoodBridge combines:

* Predictive AI
* Real-time coordination
* Gamification
* Multi-user ecosystem
* Zero-cost infrastructure
* Open-source mapping
* Offline-capable ML

Most existing platforms focus only on redistributing surplus food after waste happens.

FoodBridge focuses on:

1. Predicting waste
2. Coordinating redistribution
3. Increasing engagement
4. Scaling affordably

---

# 📈 Future Scope

Planned future improvements:

* Food waste heatmaps
* NGO analytics dashboard
* Sustainability scoring system
* Push notifications
* AI recommendation engine
* Real-time volunteer coordination
* Carbon footprint tracking

---

# ⚙️ Local Setup

## Frontend

```bash
cd web
npm install
npm run dev
```

## Backend

```bash
cd server
npm install
npm run dev
```

## AI Service

```bash
cd ai
pip install -r requirements.txt
python app.py
```

---

# 🌍 Vision

Food waste is not a storage problem.
It is a coordination problem.

FoodBridge creates the coordination layer where:

* Restaurants donate
* Shelters receive
* Individuals participate
* Waste stops

---

# 👥 Team

Built during a hackathon with a focus on:

* Real-world scalability
* AI-powered impact
* Production-style architecture
* Zero-cost deployment
* Social good through technology
