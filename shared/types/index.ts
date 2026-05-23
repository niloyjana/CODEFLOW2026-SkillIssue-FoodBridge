export type UserType = 'restaurant' | 'individual';

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  userType: 'restaurant' | 'individual';
  completedPickups: number;
  totalKgSaved?: number;      // restaurants only
  badges?: string[];           // individuals only
}

export interface FoodPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  portions: number;
  predictedWasteKg: number;
  status: 'active' | 'claimed' | 'completed';
  createdAt: string;
  pickupBy: string;
  claimedBy?: string;          // individual user ID
  claimedByName?: string;
  lat?: number;                // for map view
  lng?: number;
  address?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
  points: number;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notificationsEnabled?: boolean;
  createdAt: string;
}

export interface Claim {
  id: string;
  postId: string;
  userId: string;
  claimedAt: string;
  completedAt?: string;
  pointsAwarded: number;
}
