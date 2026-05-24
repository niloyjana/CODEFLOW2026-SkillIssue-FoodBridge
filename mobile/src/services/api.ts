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

// ─── MOCK MODE ──────────────────────────────────────────────────────────────
// Set to true to bypass Firebase auth and backend API calls for demo/testing
const MOCK_MODE = true;

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

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_POSTS: FoodPost[] = [
  {
    id: 'mock_post_1',
    restaurantId: 'mock_restaurant',
    restaurantName: 'Green Kitchen',
    portions: 12,
    predictedSurplusKg: 4.5,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    pickupBy: new Date(Date.now() + 7200000).toISOString(),
    lat: 12.9716,
    lng: 77.5946,
    address: '123 MG Road, Bangalore',
  },
  {
    id: 'mock_post_2',
    restaurantId: 'mock_restaurant',
    restaurantName: 'Spice Garden',
    portions: 8,
    predictedSurplusKg: 3.2,
    status: 'active',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    pickupBy: new Date(Date.now() + 3600000).toISOString(),
    lat: 12.9352,
    lng: 77.6245,
    address: '456 Koramangala, Bangalore',
  },
  {
    id: 'mock_post_3',
    restaurantId: 'mock_restaurant_2',
    restaurantName: 'Daily Bites',
    portions: 20,
    predictedSurplusKg: 7.0,
    status: 'claimed',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    pickupBy: new Date(Date.now() + 1800000).toISOString(),
    claimedBy: 'mock_shelter',
    claimedByName: 'Hope Shelter',
    lat: 12.9611,
    lng: 77.6387,
    address: '789 Indiranagar, Bangalore',
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'Green Kitchen', points: 450, userType: 'restaurant', completedPickups: 30, totalKgSaved: 120 },
  { id: '2', name: 'Spice Garden', points: 380, userType: 'restaurant', completedPickups: 25, totalKgSaved: 95 },
  { id: '3', name: 'Hope Shelter', points: 320, userType: 'shelter', completedPickups: 22, peopleServed: 500 },
  { id: '4', name: 'Rahul M', points: 210, userType: 'individual', completedPickups: 15, badges: ['First Pickup', 'Weekly Hero'] },
  { id: '5', name: 'Daily Bites', points: 180, userType: 'restaurant', completedPickups: 12, totalKgSaved: 55 },
];

let mockPostsInMemory = [...MOCK_POSTS];

const getAuthHeaders = async () => {
  if (MOCK_MODE) return {};
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken(true);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const apiService = {
  login: async (email: string, type: UserType): Promise<User> => {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      const user: User = {
        id: `mock_${type}`,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email,
        type,
        points: type === 'restaurant' ? 450 : type === 'shelter' ? 320 : 210,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }

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
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      const user: User = {
        id: `mock_${type}`,
        name,
        email,
        type,
        points: 0,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }

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
    if (!MOCK_MODE) {
      await signOut(firebaseAuth);
      try {
        await axios.post(`${ENDPOINTS.auth}/logout`);
      } catch {}
    }
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
    if (MOCK_MODE) {
      return [...mockPostsInMemory];
    }
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
    if (MOCK_MODE) {
      const newPost: FoodPost = {
        id: `mock_${Date.now()}`,
        restaurantId: postData.currentUser.id,
        restaurantName: postData.currentUser.name,
        portions: postData.portions,
        predictedSurplusKg: postData.portions * 0.35,
        status: 'active',
        createdAt: new Date().toISOString(),
        pickupBy: new Date(Date.now() + 7200000).toISOString(),
        lat: 12.9716,
        lng: 77.5946,
        address: postData.currentUser.address || 'Mock Address',
      };
      mockPostsInMemory.unshift(newPost);
      return newPost;
    }
    const headers = await getAuthHeaders();
    const response = await axios.post(ENDPOINTS.posts, postData, { headers });
    return response.data;
  },

  claimPost: async (postId: string, currentUser: User): Promise<FoodPost> => {
    if (MOCK_MODE) {
      const post = mockPostsInMemory.find((p) => p.id === postId);
      if (post) {
        post.status = 'claimed';
        post.claimedBy = currentUser.id;
        post.claimedByName = currentUser.name;
      }
      return post!;
    }
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
    if (MOCK_MODE) {
      const post = mockPostsInMemory.find((p) => p.id === postId);
      if (post) {
        post.status = 'claimed';
        post.claimedBy = currentUser.id;
        post.claimedByName = currentUser.name;
      }
      return post!;
    }
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
    if (MOCK_MODE) {
      const post = mockPostsInMemory.find((p) => p.id === postId);
      if (post) {
        post.status = 'completed';
      }
      return post!;
    }
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${ENDPOINTS.posts}/${postId}/complete`,
      { userId: currentUser.id },
      { headers }
    );
    return response.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    if (MOCK_MODE) {
      return [...MOCK_LEADERBOARD];
    }
    const headers = await getAuthHeaders();
    const response = await axios.get(ENDPOINTS.leaderboard, { headers });
    return response.data;
  },
};
