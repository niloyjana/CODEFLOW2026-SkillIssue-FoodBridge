import React from 'react';
import { ActivityIndicator, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { Colors, FontSize, FontWeight } from './src/theme';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantScreen from './src/screens/RestaurantScreen';
import ShelterScreen from './src/screens/ShelterScreen';
import IndividualScreen from './src/screens/IndividualScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function getTabIcon(routeName: string, focused: boolean) {
  const icons: Record<string, string> = {
    HomeTab: '🏠',
    RestaurantTab: '🍽️',
    ShelterTab: '🏛️',
    IndividualTab: '❤️',
    LeaderboardTab: '🏆',
  };
  return icons[routeName] || '📱';
}

function MainTabs() {
  const { user, logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 18 }}>{getTabIcon(route.name, focused)}</Text>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: FontWeight.semibold,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
          color: Colors.primary,
          fontWeight: FontWeight.bold,
          fontSize: FontSize.lg,
        },
        headerShadowVisible: false,
        headerRight: () =>
          user ? (
            <TouchableOpacity onPress={logout} style={ns.logoutBtn}>
              <Text style={ns.logoutText}>Logout</Text>
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home', tabBarLabel: 'Home' }} />
      {(!user || user.type === 'restaurant') && (
        <Tab.Screen name="RestaurantTab" component={RestaurantScreen} options={{ title: 'Restaurant', tabBarLabel: 'Restaurant' }} />
      )}
      {(!user || user.type === 'shelter') && (
        <Tab.Screen name="ShelterTab" component={ShelterScreen} options={{ title: 'Shelter', tabBarLabel: 'Shelter' }} />
      )}
      {(!user || user.type === 'individual') && (
        <Tab.Screen name="IndividualTab" component={IndividualScreen} options={{ title: 'Individual', tabBarLabel: 'Individual' }} />
      )}
      <Tab.Screen name="LeaderboardTab" component={LeaderboardScreen} options={{ title: 'Leaderboard', tabBarLabel: 'Leaderboard' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={ns.loadingContainer}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌉</Text>
        <Text style={ns.loadingTitle}>FoodBridge</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const ns = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  logoutBtn: {
    marginRight: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(244,67,54,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.2)',
  },
  logoutText: {
    color: Colors.error,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
});
