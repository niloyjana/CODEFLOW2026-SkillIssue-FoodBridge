export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const AI_BASE_URL = process.env.REACT_APP_AI_URL || 'http://localhost:5001';

export const ENDPOINTS = {
  posts: `${API_BASE_URL}/api/posts`,
  predict: `${AI_BASE_URL}/predict`,
  leaderboard: `${API_BASE_URL}/api/leaderboard`,
  claim: `${API_BASE_URL}/api/posts/claim`,
  claimIndividual: `${API_BASE_URL}/api/claims/individual`,
  claimBulk: `${API_BASE_URL}/api/claims/bulk`,
  auth: `${API_BASE_URL}/api/auth`,
  notifications: `${API_BASE_URL}/api/notifications`,
} as const;
