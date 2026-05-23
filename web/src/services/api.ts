import { FoodPost, LeaderboardEntry, User, UserType } from 'shared/types';
import { ENDPOINTS } from 'shared/constants/endpoints';
import { MOCK_POSTS, MOCK_LEADERBOARD, MOCK_RESTAURANT_USER, MOCK_SHELTER_USER } from './mockData';

// Setup local storage keys
const STORAGE_KEYS = {
  POSTS: 'foodshare_posts',
  LEADERBOARD: 'foodshare_leaderboard',
  SESSION: 'foodshare_session',
};

// Initialize localStorage if not set
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(MOCK_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(MOCK_LEADERBOARD));
  }
};

initializeStorage();

export const apiService = {
  // Authentication
  login: async (email: string, type: UserType): Promise<User> => {
    console.log(`API Call to ${ENDPOINTS.auth}/login:`, { email, type });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let user: User;
    if (type === 'restaurant') {
      user = {
        ...MOCK_RESTAURANT_USER,
        email: email || MOCK_RESTAURANT_USER.email,
      };
    } else {
      user = {
        ...MOCK_SHELTER_USER,
        email: email || MOCK_SHELTER_USER.email,
      };
    }

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  register: async (name: string, email: string, type: UserType): Promise<User> => {
    console.log(`API Call to ${ENDPOINTS.auth}/register:`, { name, email, type });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user: User = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      type,
      points: 0,
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getCurrentSession: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  // Food Posts
  getPosts: async (): Promise<FoodPost[]> => {
    console.log(`API Call to GET ${ENDPOINTS.posts}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const posts = localStorage.getItem(STORAGE_KEYS.POSTS);
    return posts ? JSON.parse(posts) : [];
  },

  createPost: async (postData: {
    portions: number;
    mealTime: FoodPost['mealTime'];
    venueType: FoodPost['venueType'];
    seatingCapacity: number;
    currentUser: User;
  }): Promise<FoodPost> => {
    console.log(`API Call to POST ${ENDPOINTS.posts}`, postData);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simulate AI Prediction Call
    console.log(`API Call to AI PREDICT ${ENDPOINTS.predict}`);
    const portionsFactor = postData.portions * 0.18;
    const capacityFactor = (postData.seatingCapacity / 100) * (postData.mealTime === 'dinner' ? 1.4 : 0.8);
    const venueFactor = postData.venueType === 'fastfood' ? 0.9 : postData.venueType === 'restaurant' ? 0.5 : 0.2;
    const predictedWasteKg = Math.max(0.5, parseFloat((portionsFactor + capacityFactor + venueFactor).toFixed(2)));

    const posts: FoodPost[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    
    // Set pickup to 4 hours from now
    const pickupTime = new Date();
    pickupTime.setHours(pickupTime.getHours() + 4);

    const newPost: FoodPost = {
      id: `post_${Math.random().toString(36).substr(2, 9)}`,
      restaurantId: postData.currentUser.id,
      restaurantName: postData.currentUser.name,
      portions: postData.portions,
      predictedWasteKg,
      mealTime: postData.mealTime,
      venueType: postData.venueType,
      seatingCapacity: postData.seatingCapacity,
      status: 'active',
      createdAt: new Date().toISOString(),
      pickupBy: pickupTime.toISOString(),
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Update restaurant points (+10 points for posting)
    const leaderboard: LeaderboardEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    const userIndex = leaderboard.findIndex((item) => item.id === postData.currentUser.id);
    if (userIndex > -1) {
      leaderboard[userIndex].points += 10;
    } else {
      leaderboard.push({
        id: postData.currentUser.id,
        name: postData.currentUser.name,
        points: postData.currentUser.points + 10,
        type: 'restaurant',
        completedPickups: 0,
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
    console.log(`API Call to POST ${ENDPOINTS.claim}`, { postId, shelterId: currentUser.id });
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
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Update shelter points (+15 points for claiming a pickup)
    const leaderboard: LeaderboardEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    const userIndex = leaderboard.findIndex((item) => item.id === currentUser.id);
    if (userIndex > -1) {
      leaderboard[userIndex].points += 15;
      leaderboard[userIndex].completedPickups += 1;
    } else {
      leaderboard.push({
        id: currentUser.id,
        name: currentUser.name,
        points: currentUser.points + 15,
        type: 'shelter',
        completedPickups: 1,
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
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    console.log(`API Call to GET ${ENDPOINTS.leaderboard}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const leaderboard = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return leaderboard ? JSON.parse(leaderboard) : [];
  },
};
