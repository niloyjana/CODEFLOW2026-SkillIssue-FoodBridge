import { FoodPost, LeaderboardEntry, User } from 'shared/types';

export const MOCK_RESTAURANT_USER: User = {
  id: 'rest_1',
  email: 'restaurant@foodbridge.com',
  name: 'Pizza Palace',
  type: 'restaurant',
  points: 95,
  phone: '555-0199',
  address: '123 Pizza Way, Foodtown',
  lat: 40.7128,
  lng: -74.0060,
  notificationsEnabled: true,
  createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
};

export const MOCK_INDIVIDUAL_USER: User = {
  id: 'individual_1',
  email: 'individual@foodbridge.com',
  name: 'Alex Volunteer',
  type: 'individual',
  points: 150,
  phone: '555-0144',
  address: '456 Helping Hand Ave, Townsville',
  lat: 40.7250,
  lng: -74.0100,
  notificationsEnabled: true,
  createdAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
};

export const MOCK_POSTS: FoodPost[] = [
  {
    id: 'post_1',
    restaurantId: 'rest_1',
    restaurantName: 'Pizza Palace',
    portions: 25,
    predictedWasteKg: 5.4,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    pickupBy: new Date(Date.now() + 7200000).toISOString(), // in 2 hours
    address: '123 Pizza Way, Foodtown',
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: 'post_2',
    restaurantId: 'rest_2',
    restaurantName: 'Green Cafe',
    portions: 12,
    predictedWasteKg: 2.1,
    status: 'active',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    pickupBy: new Date(Date.now() + 3600000).toISOString(), // in 1 hour
    address: '88 Coffee Road, Townsville',
    lat: 40.7150,
    lng: -74.0020,
  },
  {
    id: 'post_3',
    restaurantId: 'rest_3',
    restaurantName: 'Burger Junction',
    portions: 40,
    predictedWasteKg: 8.5,
    status: 'claimed',
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    pickupBy: new Date(Date.now() + 1800000).toISOString(), // in 30 mins
    claimedBy: 'individual_1',
    claimedByName: 'Alex Volunteer',
    address: '77 Fast Food Lane, Metroville',
    lat: 40.7300,
    lng: -73.9950,
  },
  {
    id: 'post_4',
    restaurantId: 'rest_2',
    restaurantName: 'Green Cafe',
    portions: 50,
    predictedWasteKg: 10.2,
    status: 'active',
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    pickupBy: new Date(Date.now() + 14400000).toISOString(), // in 4 hours
    address: '88 Coffee Road, Townsville',
    lat: 40.7150,
    lng: -74.0020,
  },
];

export const MOCK_SHELTER_USER: User = {
  id: 'shelter_1',
  email: 'shelter@foodbridge.com',
  name: 'Hope Community Shelter',
  type: 'shelter',
  points: 250,
  phone: '555-0211',
  address: '789 Care Blvd, City Center',
  lat: 40.7100,
  lng: -74.0090,
  capacity: 200,
  licenseNumber: 'SHELTER-123-2026',
  verified: true,
  peopleServed: 450,
  notificationsEnabled: true,
  createdAt: new Date(Date.now() - 25 * 24 * 3600000).toISOString(),
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  // Restaurants (with totalKgSaved)
  {
    id: 'rest_2',
    name: 'Green Cafe',
    points: 180,
    userType: 'restaurant',
    completedPickups: 18,
    totalKgSaved: 36.5,
  },
  {
    id: 'rest_1',
    name: 'Pizza Palace',
    points: 95,
    userType: 'restaurant',
    completedPickups: 9,
    totalKgSaved: 18.2,
  },
  {
    id: 'rest_3',
    name: 'Burger Junction',
    points: 70,
    userType: 'restaurant',
    completedPickups: 7,
    totalKgSaved: 15.0,
  },
  {
    id: 'rest_4',
    name: 'Sweet Delights Bakery',
    points: 50,
    userType: 'restaurant',
    completedPickups: 5,
    totalKgSaved: 8.5,
  },
  {
    id: 'rest_5',
    name: 'Bistro Central',
    points: 30,
    userType: 'restaurant',
    completedPickups: 3,
    totalKgSaved: 5.2,
  },
  // Shelters (with peopleServed)
  {
    id: 'shelter_1',
    name: 'Hope Community Shelter',
    points: 250,
    userType: 'shelter',
    completedPickups: 15,
    peopleServed: 450,
  },
  {
    id: 'shelter_2',
    name: 'Safe Haven Refuge',
    points: 180,
    userType: 'shelter',
    completedPickups: 10,
    peopleServed: 320,
  },
  {
    id: 'shelter_3',
    name: 'Grace Soup Kitchen',
    points: 120,
    userType: 'shelter',
    completedPickups: 7,
    peopleServed: 210,
  },
  // Individuals (with badges)
  {
    id: 'individual_1',
    name: 'Alex Volunteer',
    points: 150,
    userType: 'individual',
    completedPickups: 15,
    badges: ['Surplus Savior', 'Early Bird'],
  },
  {
    id: 'individual_2',
    name: 'Sam Helper',
    points: 120,
    userType: 'individual',
    completedPickups: 12,
    badges: ['Community Hero'],
  },
  {
    id: 'individual_3',
    name: 'Taylor Care',
    points: 85,
    userType: 'individual',
    completedPickups: 8,
    badges: ['Consistent Packer'],
  },
  {
    id: 'individual_4',
    name: 'Morgan Friendly',
    points: 60,
    userType: 'individual',
    completedPickups: 6,
    badges: ['Eco Warrior'],
  },
  {
    id: 'individual_5',
    name: 'Jordan Kind',
    points: 40,
    userType: 'individual',
    completedPickups: 4,
    badges: ['First Step'],
  },
];
