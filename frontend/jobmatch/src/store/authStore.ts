import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface BaseUser {
  id: number;
  email: string;
  full_name: string;
  profile_completed?: boolean;
}

interface CandidateUser extends BaseUser {
  role: 'candidate';
  cv_id?: string;
}

interface RecruiterUser extends BaseUser {
  role: 'recruiter';
  company_name?: string;
}

type User = CandidateUser | RecruiterUser;

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (token: string, user: User) => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Start with no user (will be set when role is selected)
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

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

  // Set token only
  setToken: (token) => set({ token }),

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Logout - clear everything and return to role selection
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
  // In NO AUTH MODE, this just returns empty state
  loadAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Try to get stored user (in case they already selected a role)
      const userJson = await AsyncStorage.getItem('user');
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (userJson && token) {
        const user = JSON.parse(userJson);
        set({ 
          token,
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
        return;
      }
      
      // No stored auth - stay on role selection
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
