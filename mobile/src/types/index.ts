export type UserType = 'restaurant' | 'shelter' | 'individual';

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  userType: 'restaurant' | 'shelter' | 'individual';
  completedPickups: number;
  totalKgSaved?: number;
  badges?: string[];
  peopleServed?: number;
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
  claimedBy?: string;
  claimedByName?: string;
  lat?: number;
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
  capacity?: number;
  licenseNumber?: string;
  verified?: boolean;
  peopleServed?: number;
}
