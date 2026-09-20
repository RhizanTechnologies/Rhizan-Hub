'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { apiFetch } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  quickSwitch: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('rhizan_token');
    const savedUser = localStorage.getItem('rhizan_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    } else {
      // Default to Abdulaziz for fast internal testing if no user is logged in
      const defaultUser: User = {
        name: 'Abdulaziz',
        email: 'abdulaziz@rhizan.com',
        role: 'ADMIN',
        title: 'Development',
        weeklyCapacityHours: 40,
        status: 'ACTIVE',
      };
      setUser(defaultUser);
      localStorage.setItem('rhizan_user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string = 'password123') => {
    try {
      const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('rhizan_token', data.token);
      localStorage.setItem('rhizan_user', JSON.stringify(data.user));
    } catch (err) {
      console.warn('Backend login unavailable, logging in local profile:', err);
      // Fallback for seamless demo
      const fallbackUser: User = {
        name: email.includes('nebiyu')
          ? 'Nebiyu'
          : email.includes('sadam')
          ? 'Sadam'
          : 'Abdulaziz',
        email,
        role: email.includes('abdulaziz') ? 'ADMIN' : 'MEMBER',
        title: email.includes('nebiyu')
          ? 'Business / Client'
          : email.includes('sadam')
          ? 'Operations / Product'
          : 'Development',
        weeklyCapacityHours: 40,
        status: 'ACTIVE',
      };
      setUser(fallbackUser);
      localStorage.setItem('rhizan_user', JSON.stringify(fallbackUser));
    }
  };

  const quickSwitch = async (name: string) => {
    const email = `${name.toLowerCase()}@rhizan.com`;
    await login(email, 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rhizan_token');
    localStorage.removeItem('rhizan_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, quickSwitch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
