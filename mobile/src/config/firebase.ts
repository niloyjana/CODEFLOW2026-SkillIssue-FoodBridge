import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDNPICw8gN474MvVt6Mea3Hor4sbkadbEc',
  authDomain: 'foodbridge-16a01.firebaseapp.com',
  projectId: 'foodbridge-16a01',
  storageBucket: 'foodbridge-16a01.firebasestorage.app',
  messagingSenderId: '582569049253',
  appId: '1:582569049253:web:7f9db9919ab8dbeb2b614c',
};

const app = initializeApp(firebaseConfig);

// On native, use AsyncStorage persistence; on web, use default browser persistence
let auth: ReturnType<typeof getAuth>;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export default app;
