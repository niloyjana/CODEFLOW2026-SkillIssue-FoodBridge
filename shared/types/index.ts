export type UserType = 'restaurant' | 'shelter' | 'individual';

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  userType: 'restaurant' | 'shelter' | 'individual';
  completedPickups: number;
  totalKgSaved?: number;      // restaurants only
  badges?: string[];           // individuals only
  peopleServed?: number;       // shelters only
}

export interface FoodPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  portions: number;
  predictedSurplusKg: number;
  status: 'active' | 'claimed' | 'completed' | 'deleted';
  createdAt: string;
  pickupBy: string;
  claimedBy?: string;          // user ID (individual or shelter)
  claimedByName?: string;
  lat?: number;                // for map view
  lng?: number;
  address?: string;
  deleteReason?: string;
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
  capacity?: number;           // shelters only
  licenseNumber?: string;      // shelters only
  verified?: boolean;          // shelters only
  peopleServed?: number;       // shelters only
}

export interface Claim {
  id: string;
  postId: string;
  userId: string;
  claimedAt: string;
  completedAt?: string;
  pointsAwarded: number;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'claim' | 'complete';
  createdAt: string;
  read: boolean;
  postId: string;
}
