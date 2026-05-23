# FoodShareHackathon

FoodShareHackathon is a modern, collaborative platform connecting restaurants with individual volunteers to save food waste and feed the community.

---

## 1. Redesigned Impact Leaderboards
The application features two central tabs:
- **Restaurants Leaderboard**: Ranks partner kitchens based on their total food portions shared, pickups, and overall weight of food waste saved (`totalKgSaved`).
- **Individuals Leaderboard**: Ranks individual volunteers and community members based on completed pickups and earned badges (e.g., `'Surplus Savior'`, `'Community Hero'`).

---

## 2. Team Member Roles

- **💻 Web Developer**: 
  - Builds components, routes, styles, and custom state hooks.
  - Integrates endpoints using path maps.
  - Controls local localStorage simulation in `MOCK_MODE`.
- **⚙️ Backend Developer**: 
  - Manages database schemas, authentication tokens, API gateways, and leaderboard aggregations.
  - Refers to [backend/SCHEMA.md](file:///f:/MyPrograms/College%20Hackathon/foodshare/backend/SCHEMA.md) for Firestore schemas and compound indexes.
- **🧠 AI Developer**: 
  - Trains prediction models using factors such as seating capacity, meal times, portions, and venue types to estimate surplus food waste in kilograms.
  - Deploys prediction endpoints under `/predict`.

---

## 3. Branching Strategy
To avoid merge conflicts during the hackathon:
- **`main`**: Protected branch representing the stable release. Do not push directly.
- **`web/*`**: Feature branches for frontend work.
- **`backend/*`**: Feature branches for database models and server development.
- **`ai/*`**: Feature branches for AI/ML scripts.
- **Pull Request Protocol**: Submit a PR to merge into `main` using the [.github/PULL_REQUEST_TEMPLATE.md](file:///f:/MyPrograms/College%20Hackathon/foodshare/.github/PULL_REQUEST_TEMPLATE.md). Require at least one peer approval.

---

## 4. Setup Instructions

### Web Developer Setup
1. Navigate to the frontend directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server (automatically syncs the `shared/` folder):
   ```bash
   npm start
   ```

### Backend Developer Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure Firestore connection and copy [backend/SCHEMA.md](file:///f:/MyPrograms/College%20Hackathon/foodshare/backend/SCHEMA.md) rules.
3. Install packages and set port to `5000` (`http://localhost:5000`).

### AI Developer Setup
1. Navigate to the AI directory:
   ```bash
   cd ai
   ```
2. Set up virtual environment and install ML packages.
3. Run the Python flask/fastapi application on port `5001` (`http://localhost:5001`).
