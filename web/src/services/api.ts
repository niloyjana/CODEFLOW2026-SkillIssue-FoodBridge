import axios from 'axios';
import { FoodPost, LeaderboardEntry, User, UserType, AppNotification } from 'shared/types';
import { ENDPOINTS } from 'shared/constants/endpoints';
import { auth as firebaseAuth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

import { MOCK_POSTS, MOCK_LEADERBOARD } from './mockData';

// Toggle for switching between mock simulation and actual API calls
export const MOCK_MODE = false;

let mockPostsInMemory = [...MOCK_POSTS];
let mockLeaderboardInMemory = [...MOCK_LEADERBOARD];

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
    const password = `${email.split('@')[0]}FB123!`;

    if (!MOCK_MODE) {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const response = await axios.post(
        `${ENDPOINTS.auth}/login`,
        { email, type },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      const user = response.data;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }

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

  register: async (name: string, email: string, type: UserType, extraFields?: any): Promise<User> => {
    const password = `${email.split('@')[0]}FB123!`;

    if (!MOCK_MODE) {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const response = await axios.post(
        `${ENDPOINTS.auth}/register`,
        { name, email, type, ...extraFields },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      const user = response.data;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }

    console.log(`API Call to ${ENDPOINTS.auth}/register (MOCK):`, { name, email, type, ...extraFields });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user: User = {
      id: `mock_user`,
      name,
      email,
      type,
      points: 0,
      createdAt: new Date().toISOString(),
      ...extraFields
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
    
    let result = [...mockPostsInMemory];
    if (params?.status) {
      result = result.filter(p => p.status === params.status);
    }
    if (params?.restaurantId) {
      result = result.filter(p => p.restaurantId === params.restaurantId);
    }
    if (params?.userId) {
      result = result.filter(p => p.claimedBy === params.userId);
    }
    return result;
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

    const newPost: FoodPost = {
      id: `mock_post_${Date.now()}`,
      restaurantId: postData.currentUser.id,
      restaurantName: postData.currentUser.name,
      portions: postData.portions,
      predictedWasteKg: parseFloat((postData.portions * 0.22).toFixed(1)),
      status: 'active',
      createdAt: new Date().toISOString(),
      pickupBy: new Date(Date.now() + 7200000).toISOString(),
      address: postData.currentUser.address,
      lat: postData.currentUser.lat,
      lng: postData.currentUser.lng,
    };
    
    mockPostsInMemory.unshift(newPost);
    return newPost;
  },

  claimPost: async (postId: string, currentUser: User): Promise<FoodPost> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.post(ENDPOINTS.claimIndividual, { postId, userId: currentUser.id }, { headers });
      return response.data;
    }

    const postIdx = mockPostsInMemory.findIndex(p => p.id === postId);
    if (postIdx === -1) throw new Error('Post not found');
    const post = mockPostsInMemory[postIdx];
    if (post.status !== 'active' || post.portions < 1) throw new Error('No portions available');
    
    const updated = {
      ...post,
      portions: post.portions - 1,
      status: (post.portions - 1 === 0) ? 'claimed' as const : 'active' as const,
      claimedBy: (post.portions - 1 === 0) ? currentUser.id : undefined,
      claimedByName: (post.portions - 1 === 0) ? currentUser.name : undefined,
    };
    mockPostsInMemory[postIdx] = updated;
    
    currentUser.points += 10;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentUser));
    
    return updated;
  },

  claimBulkOrder: async (postId: string, portions: number, currentUser: User): Promise<FoodPost> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        ENDPOINTS.claimBulk,
        { postId, userId: currentUser.id, portions },
        { headers }
      );
      return response.data;
    }

    const postIdx = mockPostsInMemory.findIndex(p => p.id === postId);
    if (postIdx === -1) throw new Error('Post not found');
    const post = mockPostsInMemory[postIdx];
    if (post.status !== 'active' || post.portions < portions) throw new Error('Not enough portions available');
    
    const updated = {
      ...post,
      portions: post.portions - portions,
      status: (post.portions - portions === 0) ? 'claimed' as const : 'active' as const,
      claimedBy: currentUser.id,
      claimedByName: currentUser.name,
    };
    mockPostsInMemory[postIdx] = updated;
    
    currentUser.points += portions * 5;
    currentUser.peopleServed = (currentUser.peopleServed || 0) + portions;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentUser));
    
    return updated;
  },

  completePost: async (postId: string, currentUser: User): Promise<FoodPost> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${ENDPOINTS.posts}/${postId}/complete`,
        { userId: currentUser.id },
        { headers }
      );
      return response.data;
    }

    const postIdx = mockPostsInMemory.findIndex(p => p.id === postId);
    if (postIdx === -1) throw new Error('Post not found');
    const post = mockPostsInMemory[postIdx];
    
    const updated = {
      ...post,
      status: 'completed' as const,
    };
    mockPostsInMemory[postIdx] = updated;
    return updated;
  },

  // Leaderboard
  getLeaderboard: async (type?: 'restaurants' | 'shelters' | 'individuals'): Promise<LeaderboardEntry[]> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.get(ENDPOINTS.leaderboard, { params: { type }, headers });
      return response.data;
    }

    let result = [...mockLeaderboardInMemory];
    if (type) {
      const filterType = type === 'restaurants' ? 'restaurant' : type === 'shelters' ? 'shelter' : 'individual';
      result = result.filter(e => e.userType === filterType);
    }
    return result.sort((a, b) => b.points - a.points);
  },

  // Notifications
  getNotifications: async (): Promise<AppNotification[]> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      const response = await axios.get(ENDPOINTS.notifications, { headers });
      return response.data;
    }

    return [
      {
        id: 'mock_notif_1',
        recipientId: 'mock_user',
        title: 'Donation Claimed! 🍱',
        message: 'Volunteers have claimed 1 portion of your dinner donation.',
        type: 'claim',
        createdAt: new Date().toISOString(),
        read: false,
        postId: 'mock_post_1',
      }
    ];
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      await axios.post(`${ENDPOINTS.notifications}/${id}/read`, {}, { headers });
      return;
    }
    console.log(`Mock: marked notification ${id} as read`);
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    if (!MOCK_MODE) {
      const headers = await getAuthHeaders();
      await axios.post(`${ENDPOINTS.notifications}/read-all`, {}, { headers });
      return;
    }
    console.log(`Mock: marked all notifications as read`);
  },
};

export default apiService;
