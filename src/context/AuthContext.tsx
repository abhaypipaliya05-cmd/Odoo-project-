'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthenticatedUser, UserProfile } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  demoLogin: (role?: 'traveler' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const savedToken = localStorage.getItem('globetrotter_token');
        if (savedToken) {
          const userData = await api.getMe();
          setUser(userData);
        }
      } catch (err) {
        console.warn('Auto-login session expired:', err);
        localStorage.removeItem('globetrotter_token');
        localStorage.removeItem('globetrotter_user');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    await api.login(credentials);
    const profile = await api.getMe();
    setUser(profile);
  };

  const signup = async (credentials: { name: string; email: string; password: string }) => {
    await api.signup(credentials);
    const profile = await api.getMe();
    setUser(profile);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  const demoLogin = async (role: 'traveler' | 'admin' = 'traveler') => {
    const email = role === 'admin' ? 'admin@globetrotter.io' : 'alex@example.com';
    const password = 'password123';
    try {
      await login({ email, password });
    } catch {
      // If user does not exist in DB yet, auto signup
      try {
        await signup({
          name: role === 'admin' ? 'Admin User' : 'Alex Traveler',
          email,
          password,
        });
      } catch {
        // Fallback login
        await login({ email, password });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
