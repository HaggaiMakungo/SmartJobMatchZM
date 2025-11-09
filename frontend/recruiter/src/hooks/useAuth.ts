// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User, LoginCredentials, AuthResponse } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // FastAPI OAuth2 expects form data
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await api.post<AuthResponse>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user } = response.data;

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
