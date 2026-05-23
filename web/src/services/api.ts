import axios from 'axios';
import { FoodPost, LeaderboardEntry, User, UserType, Claim } from 'shared/types';
import { ENDPOINTS } from 'shared/constants/endpoints';
import { MOCK_POSTS, MOCK_LEADERBOARD, MOCK_RESTAURANT_USER, MOCK_INDIVIDUAL_USER } from './mockData';

// Toggle for switching between mock simulation and actual API calls
export const MOCK_MODE = true;

const STORAGE_KEYS = {
  POSTS: 'foodshare_posts',
  LEADERBOARD: 'foodshare_leaderboard',
  SESSION: 'foodshare_session',
  CLAIMS: 'foodshare_claims',
};

// Initialize localStorage if not set
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(MOCK_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(MOCK_LEADERBOARD));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([]));
  }
};

initializeStorage();

// Simple Haversine formula to compute distance between two coordinates
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const apiService = {
  // Authentication
  login: async (email: string, type: UserType): Promise<User> => {
    if (!MOCK_MODE) {
      const response = await axios.post(`${ENDPOINTS.auth}/login`, { email, type });
      return response.data;
    }

    console.log(`API Call to ${ENDPOINTS.auth}/login (MOCK):`, { email, type });
    await new Promise((resolve) => setTimeout(resolve, 500));

    let user: User;
    if (type === 'restaurant') {
      user = {
        ...MOCK_RESTAURANT_USER,
        email: email || MOCK_RESTAURANT_USER.email,
      };
    } else {
      user = {
        ...MOCK_INDIVIDUAL_USER,
        email: email || MOCK_INDIVIDUAL_USER.email,
      };
    }

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  register: async (name: string, email: string, type: UserType): Promise<User> => {
    if (!MOCK_MODE) {
      const response = await axios.post(`${ENDPOINTS.auth}/register`, { name, email, type });
      return response.data;
    }

    console.log(`API Call to ${ENDPOINTS.auth}/register (MOCK):`, { name, email, type });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user: User = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
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
      const response = await axios.get(ENDPOINTS.posts, { params });
      return response.data;
    }

    console.log(`API Call to GET ${ENDPOINTS.posts} (MOCK) with params:`, params);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    let posts: FoodPost[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');

    if (params) {
      const { status, restaurantId, userId, lat, lng, radius } = params;

      if (status) {
        posts = posts.filter((p) => p.status === status);
      }
      if (restaurantId) {
        posts = posts.filter((p) => p.restaurantId === restaurantId);
      }
      if (userId) {
        posts = posts.filter((p) => p.claimedBy === userId);
      }
      if (lat !== undefined && lng !== undefined && radius !== undefined) {
        posts = posts.filter((p) => {
          if (p.lat === undefined || p.lng === undefined) return false;
          const distance = getDistance(lat, lng, p.lat, p.lng);
          return distance <= radius;
        });
      }
    }

    return posts;
  },

  createPost: async (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
    currentUser: User;
  }): Promise<FoodPost> => {
    if (!MOCK_MODE) {
      const response = await axios.post(ENDPOINTS.posts, postData);
      return response.data;
    }

    console.log(`API Call to POST ${ENDPOINTS.posts} (MOCK)`, postData);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Live or simulated AI Prediction
    let predictedWasteKg = 0;
    try {
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      console.log(`Calling live AI PREDICT ${ENDPOINTS.predict} for ${dayOfWeek}`);
      const aiResponse = await axios.post(ENDPOINTS.predict, {
        dayOfWeek,
        mealTime: postData.mealTime,
        venueType: postData.venueType,
        seatingCapacity: postData.seatingCapacity,
        portions: postData.portions
      });
      predictedWasteKg = aiResponse.data.predictedKg;
      console.log(`Live AI Prediction successful: ${predictedWasteKg} kg`);
    } catch (err) {
      console.warn('Failed to call live AI prediction service, using local fallback:', err);
      const portionsFactor = postData.portions * 0.18;
      const capacityFactor = (postData.seatingCapacity / 100) * (postData.mealTime === 'dinner' ? 1.4 : 0.8);
      const venueFactor = postData.venueType === 'fastfood' ? 0.9 : postData.venueType === 'restaurant' ? 0.5 : 0.2;
      predictedWasteKg = Math.max(0.5, parseFloat((portionsFactor + capacityFactor + venueFactor).toFixed(2)));
    }

    const posts: FoodPost[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    const pickupTime = new Date();
    pickupTime.setHours(pickupTime.getHours() + 4);

    const newPost: FoodPost = {
      id: `post_${Math.random().toString(36).substr(2, 9)}`,
      restaurantId: postData.currentUser.id,
      restaurantName: postData.currentUser.name,
      portions: postData.portions,
      predictedWasteKg,
      status: 'active',
      createdAt: new Date().toISOString(),
      pickupBy: pickupTime.toISOString(),
      address: postData.currentUser.address || 'Mock Restaurant Address',
      lat: postData.currentUser.lat || 40.7128,
      lng: postData.currentUser.lng || -74.0060,
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Update restaurant points & kg saved in Leaderboards
    const leaderboard: LeaderboardEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    const userIndex = leaderboard.findIndex((item) => item.id === postData.currentUser.id);
    if (userIndex > -1) {
      leaderboard[userIndex].points += 10;
      leaderboard[userIndex].totalKgSaved = (leaderboard[userIndex].totalKgSaved || 0) + predictedWasteKg;
    } else {
      leaderboard.push({
        id: postData.currentUser.id,
        name: postData.currentUser.name,
        points: postData.currentUser.points + 10,
        userType: 'restaurant',
        completedPickups: 0,
        totalKgSaved: predictedWasteKg,
      });
    }
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));

    // Update session user points
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
      const parsedSession: User = JSON.parse(session);
      parsedSession.points += 10;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(parsedSession));
    }

    return newPost;
  },

  claimPost: async (postId: string, currentUser: User): Promise<FoodPost> => {
    if (!MOCK_MODE) {
      const response = await axios.post(ENDPOINTS.claim, { postId, userId: currentUser.id });
      return response.data;
    }

    console.log(`API Call to POST ${ENDPOINTS.claim} (MOCK)`, { postId, userId: currentUser.id });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const posts: FoodPost[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    if (posts[postIndex].status !== 'active') {
      throw new Error('Post is already claimed or completed');
    }

    posts[postIndex].status = 'claimed';
    posts[postIndex].claimedBy = currentUser.id;
    posts[postIndex].claimedByName = currentUser.name;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Log claim transactions
    const claims: Claim[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
    const newClaim: Claim = {
      id: `claim_${Math.random().toString(36).substr(2, 9)}`,
      postId,
      userId: currentUser.id,
      claimedAt: new Date().toISOString(),
      pointsAwarded: 15,
    };
    claims.push(newClaim);
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

    // Update individual points in Leaderboards
    const leaderboard: LeaderboardEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    const userIndex = leaderboard.findIndex((item) => item.id === currentUser.id);
    if (userIndex > -1) {
      leaderboard[userIndex].points += 15;
      leaderboard[userIndex].completedPickups += 1;
      
      // Update badge if they cross milestones
      const pickups = leaderboard[userIndex].completedPickups;
      const currentBadges = leaderboard[userIndex].badges || [];
      if (pickups >= 15 && !currentBadges.includes('Surplus Savior')) {
        currentBadges.push('Surplus Savior');
      } else if (pickups >= 10 && !currentBadges.includes('Community Hero')) {
        currentBadges.push('Community Hero');
      }
      leaderboard[userIndex].badges = currentBadges;
    } else {
      leaderboard.push({
        id: currentUser.id,
        name: currentUser.name,
        points: currentUser.points + 15,
        userType: 'individual',
        completedPickups: 1,
        badges: ['First Step'],
      });
    }
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));

    // Update session user points
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
      const parsedSession: User = JSON.parse(session);
      parsedSession.points += 15;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(parsedSession));
    }

    return posts[postIndex];
  },

  // Leaderboard
  getLeaderboard: async (type?: 'restaurants' | 'individuals'): Promise<LeaderboardEntry[]> => {
    if (!MOCK_MODE) {
      const response = await axios.get(ENDPOINTS.leaderboard, { params: { type } });
      return response.data;
    }

    console.log(`API Call to GET ${ENDPOINTS.leaderboard} (MOCK) with filter type:`, type);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const leaderboard: LeaderboardEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    
    if (type) {
      const entryType = type === 'restaurants' ? 'restaurant' : 'individual';
      return leaderboard.filter((entry) => entry.userType === entryType);
    }
    
    return leaderboard;
  },
};
export default apiService;
