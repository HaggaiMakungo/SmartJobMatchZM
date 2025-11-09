import { api } from './api';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: 'candidate' | 'employer_personal' | 'employer_corporate';
}

export interface PersonalEmployerRegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface CorporateEmployerRegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  company_name: string;
  job_title?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: 'candidate' | 'employer_personal' | 'employer_corporate' | 'recruiter';
    phone?: string;
    profile_completed?: boolean;
  };
}

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Store token securely
    await SecureStore.setItemAsync('auth_token', response.data.access_token);
    
    // Store user data in AsyncStorage for quick access
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Register as job seeker (candidate)
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', {
      ...data,
      role: 'candidate', // Default role
    });
    
    // Store token and user
    await SecureStore.setItemAsync('auth_token', response.data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Register as personal employer
   */
  registerPersonalEmployer: async (
    data: PersonalEmployerRegisterData
  ): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/employer/personal', data);
    
    // Store token and user
    await SecureStore.setItemAsync('auth_token', response.data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Register as corporate employer
   */
  registerCorporateEmployer: async (
    data: CorporateEmployerRegisterData
  ): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/employer/corporate', data);
    
    // Store token and user
    await SecureStore.setItemAsync('auth_token', response.data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Get current user from backend
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    
    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Logout - clear all stored auth data
   */
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('auth_token');
    await AsyncStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('auth_token');
    return !!token;
  },

  /**
   * Get stored user data (quick access without API call)
   */
  getStoredUser: async () => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
};
