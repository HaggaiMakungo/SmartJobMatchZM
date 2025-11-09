import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'candidate' | 'recruiter';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (token: string, user: User) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Set authentication (token + user)
  setAuth: async (token: string, user: User) => {
    try {
      // Store token securely
      await SecureStore.setItemAsync('auth_token', token);
      
      // Store user data in AsyncStorage for quick access
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      set({ 
        token,
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error saving auth:', error);
      throw error;
    }
  },

  // Set user only
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Logout
  logout: async () => {
    try {
      // Clear secure token
      await SecureStore.deleteItemAsync('auth_token');
      
      // Clear user data
      await AsyncStorage.removeItem('user');
      
      // Clear state
      set({ 
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Load auth from storage (for app initialization)
  loadAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Try to get token from secure storage
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (token) {
        // Get user data from AsyncStorage
        const userJson = await AsyncStorage.getItem('user');
        
        if (userJson) {
          const user = JSON.parse(userJson);
          set({ 
            token,
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
          return;
        }
      }
      
      // No auth found
      set({ 
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading auth:', error);
      set({ 
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));
