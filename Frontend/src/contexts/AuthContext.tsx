import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { clearAuthData, getAuthToken, getUserData, setAuthData, isValidToken } from '@/utils/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      const userData = getUserData();
      
      if (token && userData) {
        // Check if token is valid format
        if (!isValidToken(token)) {
          clearAuthData();
          setLoading(false);
          return;
        }

        try {
          // Verify token with backend
          const response = await authAPI.verifyToken();
          const backendUserData = response.data.user;
          
          setUser({
            id: backendUserData._id,
            email: backendUserData.email,
            name: backendUserData.name,
            role: backendUserData.role
          });
        } catch (error) {
          // Token is invalid, clear it
          clearAuthData();
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      const user: User = {
        id: userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };

      setAuthData(token, user);
      setUser(user);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'student' | 'admin') => {
    setLoading(true);
    try {
      const response = await authAPI.signup(email, password, name, role);
      const { token, user: userData } = response.data;
      
      const user: User = {
        id: userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };

      setAuthData(token, user);
      setUser(user);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};