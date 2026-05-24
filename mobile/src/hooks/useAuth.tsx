import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, UserType } from '../types';
import { apiService } from '../services/api';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, type: UserType) => Promise<void>;
  register: (
    name: string,
    email: string,
    type: UserType,
    extraFields?: any
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Track whether a manual login/register is in progress to prevent
  // onAuthStateChanged from interfering with the flow
  const isManualAuthInProgress = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        // Skip if a manual login/register is actively running
        if (isManualAuthInProgress.current) return;

        if (firebaseUser) {
          const session = await apiService.getCurrentSession();
          if (session) {
            setUser(session);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = async (email: string, type: UserType) => {
    isManualAuthInProgress.current = true;
    setLoading(true);
    try {
      const loggedUser = await apiService.login(email, type);
      setUser(loggedUser);
    } finally {
      isManualAuthInProgress.current = false;
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    type: UserType,
    extraFields?: any
  ) => {
    isManualAuthInProgress.current = true;
    setLoading(true);
    try {
      const registeredUser = await apiService.register(
        name,
        email,
        type,
        extraFields
      );
      setUser(registeredUser);
    } finally {
      isManualAuthInProgress.current = false;
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    const session = await apiService.getCurrentSession();
    setUser(session);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
