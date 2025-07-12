
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../lib/types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real app, you'd verify the token with the backend
      // and fetch user details. For now, we'll assume it's valid
      // and try to fetch the user's profile.
      const fetchUser = async () => {
        try {
          const currentUser = await api.getUserProfile('me', token); // Pass token
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('accessToken'); // Clear invalid token
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('accessToken', token);
    // Re-fetch user data after login
    try {
      const currentUser = await api.getUserProfile('me', token); // Pass token
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user profile after login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
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
