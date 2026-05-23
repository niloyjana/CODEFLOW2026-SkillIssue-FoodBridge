import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDNPICw8gN474MvVt6Mea3Hor4sbkadbEc",
  authDomain: "foodbridge-16a01.firebaseapp.com",
  projectId: "foodbridge-16a01",
  storageBucket: "foodbridge-16a01.firebasestorage.app",
  messagingSenderId: "582569049253",
  appId: "1:582569049253:web:7f9db9919ab8dbeb2b614c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
