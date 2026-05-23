import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserType } from 'shared/types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, type: UserType) => Promise<void>;
  register: (name: string, email: string, type: UserType) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const session = apiService.getCurrentSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, type: UserType) => {
    setLoading(true);
    try {
      const loggedUser = await apiService.login(email, type);
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, type: UserType) => {
    setLoading(true);
    try {
      const registeredUser = await apiService.register(name, email, type);
      setUser(registeredUser);
    } finally {
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

  const refreshSession = () => {
    const session = apiService.getCurrentSession();
    setUser(session);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, login, register, logout, refreshSession } },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
