# FoodShareHackathon Web Application

This is the React TypeScript web application for FoodShareHackathon.

## Setup Instructions

1. Install local dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm start
   ```
   *Note: This automatically triggers a prestart script to synchronize typescript types and settings from the root `/shared` directory.*

## Folder Layout
- `src/components/`: Modular building blocks (cards, buttons, layouts).
- `src/pages/`: Main layouts for logins, registrations, dashboards, and leaderboards.
- `src/hooks/`: Reactive state controllers (auth, posts, leaderboard summaries).
- `src/services/`: Mock data definitions and API handlers.
- `src/styles/`: Styled properties, global themes, color tokens, and utility layouts.
