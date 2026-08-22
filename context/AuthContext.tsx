'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (credentials: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  demoLogin: (role?: 'traveler' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
        console.warn('Auto-login session expired or invalid:', err);
        localStorage.removeItem('globetrotter_token');
        localStorage.removeItem('globetrotter_user');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.token) {
      localStorage.setItem('globetrotter_token', res.token);
      localStorage.setItem('globetrotter_user', JSON.stringify(res.user));
    }
    setUser(res.user);
  };

  const signup = async (credentials: { name: string; email: string; password: string }) => {
    const res = await api.signup(credentials);
    if (res.token) {
      localStorage.setItem('globetrotter_token', res.token);
      localStorage.setItem('globetrotter_user', JSON.stringify(res.user));
    }
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem('globetrotter_user', JSON.stringify(updated));
  };

  const demoLogin = async (role: 'traveler' | 'admin' = 'traveler') => {
    const email = role === 'admin' ? 'admin@globetrotter.io' : 'traveler@globetrotter.io';
    const password = role === 'admin' ? 'admin123' : 'password123';
    await login({ email, password });
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
