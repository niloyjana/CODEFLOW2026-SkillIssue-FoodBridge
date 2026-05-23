import axios from 'axios';
import { FoodPost, LeaderboardEntry, User, UserType, Claim } from 'shared/types';
import { ENDPOINTS } from 'shared/constants/endpoints';
import { auth as firebaseAuth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Toggle for switching between mock simulation and actual API calls
export const MOCK_MODE = false;

const STORAGE_KEYS = {
  SESSION: 'foodbridge_session',
};

// Helper to get authentication headers using Firebase ID Token
const getAuthHeaders = async () => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken(true);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const apiService = {
  // Authentication
  login: async (email: string, type: UserType): Promise<User> => {
    // Generate a consistent dummy password for email-only hackathon logins
    const password = `${email.split('@')[0]}FB123!`;

    if (!MOCK_MODE) {
      // 1. Authenticate with Firebase Auth Client SDK
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();

      // 2. Query/validate profile from the backend
      const response = await axios.post(
        `${ENDPOINTS.auth}/login`,
        { email, type },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      const user = response.data;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }

    // Mock implementation fallback (unused in production)
    console.log(`API Call to ${ENDPOINTS.auth}/login (MOCK):`, { email, type });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user: User = {
      id: `mock_user`,
      name: 'Mock User',
      email,
      type,
      points: 0,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  register: async (name: string, email: string, type: UserType): Promise<User> => {
    // Generate a consistent dummy password for email-only hackathon logins
    const password = `${email.split('@')[0]}FB123!`;

    if (!MOCK_MODE) {
      // 1. Create account with Firebase Auth Client SDK
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();

      // 2. Initialize profile database document on the backend
      const response = await axios.post(
        `${ENDPOINTS.auth}/register`,
        { name, email, type },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      const user = response.data;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }

    // Mock implementation fallback (unused in production)
    console.log(`API Call to ${ENDPOINTS.auth}/register (MOCK):`, { name, email, type });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user: User = {
      id: `mock_user`,
      name,
      email,
      type,
      points: 0,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  logout: async (): Promise<void> => {
    if (!MOCK_MODE) {
      await signOut(firebaseAuth);
      await axios.post(`${ENDPOINTS.auth}/logout`);
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getCurrentSession: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  // Food Posts
  getPosts: async (params?: {
    status?: FoodPost['status'];
    restaurantId?: string;
    userId?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<FoodPost[]> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.get(ENDPOINTS.posts, { params, headers });
      return response.data;
    }
    return [];
  },

  createPost: async (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
    currentUser: User;
  }): Promise<FoodPost> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.post(ENDPOINTS.posts, postData, { headers });
      return response.data;
    }
    throw new Error('Mock mode is disabled');
  },

  claimPost: async (postId: string, currentUser: User): Promise<FoodPost> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.post(ENDPOINTS.claim, { postId, userId: currentUser.id }, { headers });
      return response.data;
    }
    throw new Error('Mock mode is disabled');
  },

  // Leaderboard
  getLeaderboard: async (type?: 'restaurants' | 'individuals'): Promise<LeaderboardEntry[]> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.get(ENDPOINTS.leaderboard, { params: { type }, headers });
      return response.data;
    }
    return [];
  },
};

export default apiService;
