'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { apiFetch } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('rhizan_token');
      const savedUser = localStorage.getItem('rhizan_user');

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as User;
          if (isMounted) {
            setToken(savedToken);
            setUser(parsedUser);
          }

          // Verify with server whether user account still exists in database
          try {
            const verified = await apiFetch<User>('/auth/me');
            if (isMounted) {
              setUser(verified);
              localStorage.setItem('rhizan_user', JSON.stringify(verified));
            }
          } catch {
            // Account deleted or token invalid -> clear and kick to login
            if (isMounted) {
              localStorage.removeItem('rhizan_token');
              localStorage.removeItem('rhizan_user');
              setToken(null);
              setUser(null);
              if (pathname !== '/login') {
                router.replace('/login');
              }
            }
          }
        } catch {
          localStorage.removeItem('rhizan_token');
          localStorage.removeItem('rhizan_user');
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for 401/403 invalidation dispatched by apiFetch
    const handleAuthInvalidated = () => {
      if (isMounted) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('rhizan_token');
        localStorage.removeItem('rhizan_user');
      }
    };

    // Periodic heartbeat check: if user was deleted while idle, terminate session
    const checkActiveSession = async () => {
      const currentToken = localStorage.getItem('rhizan_token');
      if (!currentToken) return;
      try {
        await apiFetch('/auth/me');
      } catch {
        // apiFetch automatically purges credentials and triggers login redirect
      }
    };

    const heartbeatInterval = setInterval(checkActiveSession, 15000);
    window.addEventListener('focus', checkActiveSession);
    window.addEventListener('rhizan_auth_invalidated', handleAuthInvalidated);

    return () => {
      isMounted = false;
      clearInterval(heartbeatInterval);
      window.removeEventListener('focus', checkActiveSession);
      window.removeEventListener('rhizan_auth_invalidated', handleAuthInvalidated);
    };
  }, [pathname, router]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('rhizan_token', data.token);
      localStorage.setItem('rhizan_user', JSON.stringify(data.user));

      return data.user;
    } catch (err: any) {
      throw new Error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const data = await apiFetch<{ message: string; token: string; user: User }>(
        '/auth/change-password',
        {
          method: 'POST',
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('rhizan_token', data.token);
      localStorage.setItem('rhizan_user', JSON.stringify(data.user));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update password.');
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('rhizan_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rhizan_token');
    localStorage.removeItem('rhizan_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        changePassword,
        updateUser,
      }}
    >
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
