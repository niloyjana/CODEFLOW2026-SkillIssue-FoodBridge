# FoodBridge App Features & Technical Specification Summary

This document provides a complete technical specification and feature summary of the **FoodBridge** food-sharing hackathon application. It can be shared with other AI models or developers to verify system architecture, recreate components, or check compatibility without sharing the entire codebase.

---

## 1. Core Architecture & Tech Stack
* **Frontend**: React (v18.2.0) with TypeScript (v4.9.5), React Router DOM (v6.20.0), and Axios (v1.6.0) for API requests. Styled with Vanilla CSS (premium dark/glassmorphism design theme).
* **Backend**: Node.js Express server with TypeScript, CORS, and Dotenv.
* **Database & Auth**: Firebase Admin SDK (backend) and Firebase Client SDK (frontend) connecting to **Firestore** and **Firebase Auth**.
* **Shared Layer**: A `shared/` folder contains shared TypeScript interfaces (Types, Constants, Utilities) resolved via paths mapping on both frontend and backend.

---

## 2. Multi-Role User Types & Specific Features

The application supports three distinct user types, each with its own tailored dashboard experience and rules:

### A. Restaurant Users
* **Features**:
  * **Food Post Creator**: Can publish details of surplus food (portions count, meal time, venue type, seating capacity, address).
  * **AI Waste Prediction**: Instantly predicts waste saved in kg based on seating capacity and portions (using coefficients in the business logic).
  * **Dashboard**: Displays a list of their active posts, claimed posts, and completed donations.
  * **Stats Display**: Displays total points, total kilograms of food waste saved, and completed pickups.
* **Constraints**:
  * Cannot claim food posts.
  * Must specify address and coordinates (latitude/longitude) during registration.

### B. Shelter Users
* **Features**:
  * **Bulk Claim Dashboard**: Lists active restaurant posts with distance, portions, physical address, and deadline.
  * **Bulk Portion Selector**: Can choose exactly how many portions to claim up to the remaining amount available.
  * **Point Awarding**: Earns **5 points per portion** claimed (e.g., claiming 10 portions awards 50 points).
  * **Distribution Tracker (Right Sidebar)**: Shows active claims with a **"Mark as Distributed"** button. Clicking this triggers the completion endpoint, changing the post status to `completed`.
  * **Stats Header**: Displays:
    * *People Served Today* (cumulative sum of portions claimed in bulk)
    * *Shelter Points*
    * *Leaderboard Rank among Shelters*
* **Constraints**:
  * Cannot create food posts.
  * Profile requires `capacity` (people served daily) and `licenseNumber` details during registration. Verified flag defaults to `false`.

### C. Individual Volunteer Users (Donors)
* **Features**:
  * **Food Post Creator**: Can publish details of surplus food (portions count, meal time, venue type, seating capacity, address) using the predictive AI form, identical to restaurant users.
  * **AI Waste Prediction**: Instantly predicts waste saved in kg based on seating capacity and portions.
  * **Dashboard**: Displays a list of their active posts, claimed posts, and completed donations.
  * **Badges System**: Automatically achieves and displays badges based on total completed food donation posts:
    * *First Step* (>= 1 donation)
    * *Consistent Packer* (>= 5 donations)
    * *Community Hero* (>= 10 donations)
    * *Surplus Savior* (>= 15 donations)
* **Constraints**:
  * Cannot claim food posts.
  * Must specify physical address and map coordinates during registration.
  * Requires phone number registration.

---

## 3. Global App Features
* **Role-Based Navigation (Navbar)**: Dynamic rendering showing "Dashboard" (Restaurants), "Available Food" (Shelters), or "Donate Food" (Individuals) respectively, alongside points counters and logout buttons.
* **Guarded Routing (`RoleRoute`)**: Enforces path permissions (e.g., `/shelter` only allows type `shelter`). Non-matching roles are automatically redirected to their correct landing page.
* **Tabbed Leaderboard**: Divided into 3 separate leaderboards:
  1. **Restaurants**: Shows Rank, Name, Points, Completed Pickups, and total **Kg Saved**.
  2. **Shelters**: Shows Rank, Name, Points, **People Served**, and Completed Pickups.
  3. **Individuals**: Shows Rank, Name, Points, Completed Pickups, and **Badges** earned.

---

## 4. REST API Endpoint Specification

### A. Authentication Router (`/api/auth`)
* `POST /login`: Receives verified user ID token from Firebase Client SDK, loads profile from Firestore, and stores session state.
* `POST /register`: Registers user details in Firestore. Expects role-specific payloads (`capacity` & `licenseNumber` for shelters, coordinates for restaurants, `phone` for individuals). Sets `points: 0`, `completedPickups: 0`, and `verified: false` (for shelters).
* `POST /logout`: Destroys the active session.

### B. Food Posts Router (`/api/posts`)
* `GET /`: Retrieves all active posts, or filters posts by `restaurantId` (creator view) or `userId` (claimant view).
* `POST /`: Creates a post and calculates AI waste savings in kg.
* `POST /:postId/complete`: Marks a claimed post status as `'completed'`.

### C. Claims Router (`/api/claims`)
* Note: Individual claiming is deprecated as individuals now act as donors. Only shelters claim/receive food.
* `POST /bulk`: Transaction-based bulk claim endpoint.
  * Verifies post is active and claimant is a `shelter`.
  * Decrements portions count by requested bulk quantity. If portions reach 0, sets status to `'claimed'`, saving claimant ID and name.
  * Increments shelter's points by `portions * 5`, completed pickups by 1, and increases `peopleServed` by `portions`.

### D. Leaderboard Router (`/api/leaderboard`)
* `GET /`: Retrieves all registered users in Firestore. Supports query parameter `type` (`restaurants`, `shelters`, `individuals`) and returns sorted entries by points descending.

---

## 5. Mock Mode Integration (`MOCK_MODE`)
For local prototype execution without a Firebase connection:
* Set `export const MOCK_MODE = true;` in `web/src/services/api.ts`.
* In-memory arrays simulate backend database state for logins, posts, transactions, bulk claims, distribution completions, and leaderboard updates. Fully compatible with all buttons and views.
