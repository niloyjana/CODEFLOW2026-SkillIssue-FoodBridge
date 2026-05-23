export type UserType = 'restaurant' | 'shelter';
export type MealTime = 'breakfast' | 'lunch' | 'dinner';
export type VenueType = 'cafe' | 'restaurant' | 'fastfood';
export type PostStatus = 'active' | 'claimed' | 'completed';

export interface FoodPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  portions: number;
  predictedWasteKg: number;
  mealTime: MealTime;
  venueType: VenueType;
  seatingCapacity: number;
  status: PostStatus;
  createdAt: string;
  pickupBy: string;
  claimedBy?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  type: UserType;
  completedPickups: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
  points: number;
}
