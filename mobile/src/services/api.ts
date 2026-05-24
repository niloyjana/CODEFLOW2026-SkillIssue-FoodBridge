import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodPost, LeaderboardEntry, User, UserType } from '../types';
import { auth as firebaseAuth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { Platform } from 'react-native';

// Your computer's LAN IP (both phone and computer must be on the same WiFi)
const LAN_IP = '10.47.145.241';

// Web preview uses localhost, physical devices use LAN IP
const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : `http://${LAN_IP}:5000`;

const ENDPOINTS = {
  posts: `${API_BASE_URL}/api/posts`,
  leaderboard: `${API_BASE_URL}/api/leaderboard`,
  claimIndividual: `${API_BASE_URL}/api/claims/individual`,
  claimBulk: `${API_BASE_URL}/api/claims/bulk`,
  auth: `${API_BASE_URL}/api/auth`,
};

const STORAGE_KEYS = {
  SESSION: 'foodbridge_session',
};

const getAuthHeaders = async () => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken(true);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const apiService = {
  login: async (email: string, type: UserType): Promise<User> => {
    const password = `${email.split('@')[0]}FB123!`;

    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const idToken = await credential.user.getIdToken();

    const response = await axios.post(
      `${ENDPOINTS.auth}/login`,
      { email, type },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    const user = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  register: async (
    name: string,
    email: string,
    type: UserType,
    extraFields?: any
  ): Promise<User> => {
    const password = `${email.split('@')[0]}FB123!`;

    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const idToken = await credential.user.getIdToken();

    const response = await axios.post(
      `${ENDPOINTS.auth}/register`,
      { name, email, type, ...extraFields },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    const user = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  logout: async (): Promise<void> => {
    await signOut(firebaseAuth);
    try {
      await axios.post(`${ENDPOINTS.auth}/logout`);
    } catch {}
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getCurrentSession: async (): Promise<User | null> => {
    const session = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  saveSession: async (user: User): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  },

  getPosts: async (): Promise<FoodPost[]> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(ENDPOINTS.posts, { headers });
    return response.data;
  },

  createPost: async (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
    currentUser: User;
  }): Promise<FoodPost> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(ENDPOINTS.posts, postData, { headers });
    return response.data;
  },

  claimPost: async (postId: string, currentUser: User): Promise<FoodPost> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      ENDPOINTS.claimIndividual,
      { postId, userId: currentUser.id },
      { headers }
    );
    return response.data;
  },

  claimBulkOrder: async (
    postId: string,
    portions: number,
    currentUser: User
  ): Promise<FoodPost> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      ENDPOINTS.claimBulk,
      { postId, userId: currentUser.id, portions },
      { headers }
    );
    return response.data;
  },

  completePost: async (
    postId: string,
    currentUser: User
  ): Promise<FoodPost> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${ENDPOINTS.posts}/${postId}/complete`,
      { userId: currentUser.id },
      { headers }
    );
    return response.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(ENDPOINTS.leaderboard, { headers });
    return response.data;
  },
};
