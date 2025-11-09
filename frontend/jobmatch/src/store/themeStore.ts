import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false, // Light mode by default
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setTheme: (isDark) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Theme colors
const lightTheme = {
  // Main colors
  primary: '#202c39',      // gunmetal
  secondary: '#283845',    // gunmetal-2
  background: '#f2d492',   // peach yellow
  card: '#FFFFFF',
  
  // Text colors
  text: '#202c39',         // gunmetal
  textSecondary: '#283845',
  
  // Action elements
  actionBox: '#f2d492',    // peach yellow
  actionText: '#202c39',   // gunmetal
  accent: '#f29559',       // tangerine
  sage: '#b8b08d',
};

const darkTheme = {
  // Main colors (inverted)
  primary: '#f2d492',      // peach yellow
  secondary: '#f5dca7',    // lighter peach
  background: '#202c39',   // gunmetal
  card: '#283845',         // dark gunmetal
  
  // Text colors (inverted)
  text: '#f2d492',         // peach
  textSecondary: '#f5dca7',
  
  // Action elements (stay same)
  actionBox: '#f2d492',    // peach yellow
  actionText: '#202c39',   // gunmetal
  accent: '#f29559',       // tangerine
  sage: '#b8b08d',
};

export type Theme = typeof lightTheme;

// Hook to get theme colors based on dark mode state
export const useTheme = () => {
  const { isDarkMode, toggleTheme, setTheme } = useThemeStore();
  const colors = isDarkMode ? darkTheme : lightTheme;
  
  return {
    isDark: isDarkMode,
    colors,
    toggleTheme,
    setTheme,
  };
};
