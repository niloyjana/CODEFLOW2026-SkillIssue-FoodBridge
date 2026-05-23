import { FoodPost, LeaderboardEntry, User } from 'shared/types';

export const MOCK_RESTAURANT_USER: User = {
  id: 'rest_1',
  email: 'restaurant@foodshare.com',
  name: 'Pizza Palace',
  type: 'restaurant',
  points: 95,
};

export const MOCK_SHELTER_USER: User = {
  id: 'shelter_1',
  email: 'shelter@foodshare.com',
  name: 'Safe Haven Shelter',
  type: 'shelter',
  points: 150,
};

export const MOCK_POSTS: FoodPost[] = [
  {
    id: 'post_1',
    restaurantId: 'rest_1',
    restaurantName: 'Pizza Palace',
    portions: 25,
    predictedWasteKg: 5.4,
    mealTime: 'lunch',
    venueType: 'restaurant',
    seatingCapacity: 60,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    pickupBy: new Date(Date.now() + 7200000).toISOString(), // in 2 hours
  },
  {
    id: 'post_2',
    restaurantId: 'rest_2',
    restaurantName: 'Green Cafe',
    portions: 12,
    predictedWasteKg: 2.1,
    mealTime: 'breakfast',
    venueType: 'cafe',
    seatingCapacity: 20,
    status: 'active',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    pickupBy: new Date(Date.now() + 3600000).toISOString(), // in 1 hour
  },
  {
    id: 'post_3',
    restaurantId: 'rest_3',
    restaurantName: 'Burger Junction',
    portions: 40,
    predictedWasteKg: 8.5,
    mealTime: 'dinner',
    venueType: 'fastfood',
    seatingCapacity: 80,
    status: 'claimed',
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    pickupBy: new Date(Date.now() + 1800000).toISOString(), // in 30 mins
    claimedBy: 'shelter_1',
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  // Restaurants
  {
    id: 'rest_2',
    name: 'Green Cafe',
    points: 180,
    type: 'restaurant',
    completedPickups: 18,
  },
  {
    id: 'rest_1',
    name: 'Pizza Palace',
    points: 95,
    type: 'restaurant',
    completedPickups: 9,
  },
  {
    id: 'rest_3',
    name: 'Burger Junction',
    points: 70,
    type: 'restaurant',
    completedPickups: 7,
  },
  {
    id: 'rest_4',
    name: 'Sweet Delights Bakery',
    points: 50,
    type: 'restaurant',
    completedPickups: 5,
  },
  {
    id: 'rest_5',
    name: 'Bistro Central',
    points: 30,
    type: 'restaurant',
    completedPickups: 3,
  },
  // Shelters
  {
    id: 'shelter_1',
    name: 'Safe Haven Shelter',
    points: 150,
    type: 'shelter',
    completedPickups: 15,
  },
  {
    id: 'shelter_2',
    name: 'Grace Community Kitchen',
    points: 120,
    type: 'shelter',
    completedPickups: 12,
  },
  {
    id: 'shelter_3',
    name: 'Hope Food Pantry',
    points: 85,
    type: 'shelter',
    completedPickups: 8,
  },
  {
    id: 'shelter_4',
    name: 'Unity Mission House',
    points: 60,
    type: 'shelter',
    completedPickups: 6,
  },
  {
    id: 'shelter_5',
    name: 'Mercy Outreach Center',
    points: 40,
    type: 'shelter',
    completedPickups: 4,
  },
];
