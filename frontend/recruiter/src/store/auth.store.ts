import { create } from 'zustand';
import type { User } from '../types';
import { clearAllScrollPositions } from '../hooks/useScrollRestoration';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => {
    localStorage.removeItem('auth_token');
    
    // Clear all caches on logout
    localStorage.removeItem('camss-page-cache');
    clearAllScrollPositions();
    
    set({ user: null, isAuthenticated: false });
  },
}));
