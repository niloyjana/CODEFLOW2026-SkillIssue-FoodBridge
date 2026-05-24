# FoodBridge 🍲

> Restaurants donate. Shelters receive. Individuals act. Surplus is saved.

FoodBridge is an AI-powered real-time surplus-food redistribution platform designed to save food surplus and connect fresh surplus meals with local communities. The platform combines machine learning, real-time Firestore database synchronization, gamification, and open-source maps to create a scalable, zero-cost coordination system.

---

# 🚀 Problem Statement

Every day, restaurants and food businesses throw away large amounts of perfectly edible food while shelters and individuals struggle to access meals. Existing food rescue platforms mainly redistribute surplus food after it already occurs.

FoodBridge solves this through:
* **AI-powered food surplus prediction:** Helping restaurants anticipate and list surplus food before it's thrown out.
* **Real-time food redistribution:** Instant database synchronization so shelters and volunteers view live donations.
* **Gamified community participation:** Earn points and unlock badges to encourage ongoing volunteerism.
* **Zero-cost scalable architecture:** Leveraging OpenFreeMap and free geocoding services to avoid expensive API keys.
* **Smart coordination:** Connecting restaurants, shelters, and individual volunteers seamlessly.

---

# ✨ Features Implemented

## 👤 Authentication & User Roles
* Firebase Authentication integration (supporting Email/Password and Google Sign-in).
* Dynamic role selection:
  * **Restaurants:** Create food posts, access AI surplus predictions, and track historical donations.
  * **Shelters:** Browse active nearby posts on the map, claim portions in bulk, and track distribution.
  * **Individuals:** Donate food using AI prediction and earn volunteer achievements.
* Role-based guarded routing and dashboards.

---

## 📦 Food Posting & Claim System
* **Restaurants** can post surplus food listings (portions, meal time, seating capacity, pickup deadlines, coordinates).
* **Shelters** can view a map of nearby active food posts and claim portions in bulk (earning 5 points per portion).
* **Shelter Distribution Tracker** allows shelters to mark claims as "Distributed" to finalize the donation lifecycle.

---

## 🤖 AI Food Surplus Prediction
A custom machine learning service forecasts potential food surplus (in kg) at the time of posting:
* Built with Python, Flask, scikit-learn, and Random Forest Regression.
* Predictions are calculated locally using parameters: Day of Week, Meal Time, Venue Type, Seating Capacity, and Portions Prepared.
* Offline-capable model with ultra-fast local inference under 100ms.

### AI Architecture

```text
Frontend (React)
      ↓
Flask API (/predict)
      ↓
Random Forest Model
      ↓
Prediction Response
```

Example JSON Response:
```json
{
  "predictedKg": 8.5,
  "confidence": 0.85
}
```

---

## 🗺️ Real-Time Maps & Routing
Integrated a fully free, open-source mapping stack to avoid expensive API subscriptions:
* **OpenFreeMap:** Map rendering using MapLibre GL and Liberty tiles.
* **Nominatim:** Free geolocation search, autocomplete, and address reverse-geocoding.
* **OSRM:** Free route optimization and distance matrix estimation.
* **Features:** Geolocation-aware listings, interactive pin pickers, and live delivery routes.

---

## 🏆 Gamification & Leaderboard
FoodBridge drives community engagement with reputation tracking:
* **Restaurants:** Ranked by total kilograms of food surplus saved.
* **Shelters:** Ranked by cumulative meals/portions distributed.
* **Individuals:** Earn points and achieve badges (*First Step*, *Consistent Packer*, *Community Hero*, *Surplus Savior*) for donations.
* Live global leaderboards sorted by user points.

---

## ⚡ Real-Time Synchronization
* Built using Google Cloud Firestore.
* Real-time listeners automatically update listings, claims, and dashboard points.
* Transaction-based logic prevents double claiming of portions under concurrent usage.

---

# 🛠️ Tech Stack

| Layer           | Technology         |
| --------------- | ------------------ |
| Web Frontend    | React + TypeScript |
| Mobile Frontend | React Native + Expo|
| Backend API     | Node.js + Express  |
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
├── web/                # React web frontend
├── backend/            # Express Node.js backend
├── mobile/             # React Native (Expo) mobile frontend
├── ai/                 # Flask ML service (model training & inference)
│   ├── app.py
│   ├── train.py
│   ├── generate_data.py
│   └── model.pkl
└── shared/             # Shared TypeScript constants, types, and endpoints
```

---

# 🔥 Why FoodBridge Stands Out

Unlike traditional platforms, FoodBridge combines:
1. **Predictive Forecasting:** Flagging potential surplus *before* it gets thrown away.
2. **Real-time Sync & Transaction Safety:** Instant updates with zero portion-overlap.
3. **Gamification:** Keeps volunteers and restaurants active with points and badges.
4. **Zero API Cost Infrastructure:** Runs mapping, routing, and AI models on completely free, open-source stacks.

---

# ⚙️ Local Setup & Run Instructions

To run the full stack locally, follow these instructions.

### 1. Frontend Web App
```bash
cd web
npm install
npm start
```
*App will start on `http://localhost:3000`*

### 2. Mobile App (Expo React Native)
```bash
cd mobile
npm install
npm start
```
*Use the Expo Go app on your phone to scan the QR code and run it.*

### 3. Backend Server
Make sure to create a `.env` file in the `backend/` directory referencing your Firebase project credentials.
```bash
cd backend
npm install
npm run dev
```
*Server will start on `http://localhost:5000`*

### 4. AI Machine Learning Service
```bash
cd ai
pip install -r requirements.txt
python app.py
```
*Flask service will start on `http://localhost:5001` or `http://localhost:5002` (depending on local configuration)*

---

# 🌍 Vision

Food surplus is not a supply problem. It is a **coordination problem**. FoodBridge provides the coordination layer to ensure surplus food is redirected to where it matters most, in real time.

---

# 👥 Team

Built during the College Hackathon with a focus on real-world scalability, AI-powered social impact, and zero-cost infrastructure.
