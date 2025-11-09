/**
 * Theme utilities for light/dark mode
 * Complete color inversion between light and dark modes
 */

export const theme = {
  light: {
    // Background colors - Peach in light mode
    background: '#f2d492',      // peach-500
    backgroundSecondary: '#f5dca7', // peach-600
    
    // Text colors - Gunmetal in light mode
    text: '#202c39',            // primary (gunmetal)
    textSecondary: '#283845',   // secondary
    textMuted: '#78704b',       // sage-300
    
    // Accent colors - Tangerine stays consistent
    accent: '#f29559',          // tangerine
    accentHover: '#ed701d',     // tangerine-400
    
    // Action boxes - Peach yellow with gunmetal text
    actionBox: '#f2d492',       // peach-500
    actionText: '#202c39',      // gunmetal
    
    // Sage accents - Stay consistent
    sage: '#b8b08d',            // sage
    sageDark: '#78704b',        // sage-300
    sageLight: '#d5d0bb',       // sage-700
    
    // Card colors
    card: '#FFFFFF',
    cardBorder: '#eab84c',      // peach-400
    
    // Status colors (keep same)
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    // Background colors - Gunmetal in dark mode
    background: '#202c39',      // primary (gunmetal)
    backgroundSecondary: '#283845', // secondary
    
    // Text colors - Peach in dark mode
    text: '#f2d492',            // peach-500
    textSecondary: '#f5dca7',   // peach-600
    textMuted: '#b8b08d',       // sage
    
    // Accent colors - Tangerine stays consistent
    accent: '#f29559',          // tangerine
    accentHover: '#f4ab7b',     // tangerine-600
    
    // Action boxes - Peach yellow with gunmetal text (INVERTED from light mode)
    actionBox: '#f2d492',       // peach-500 (same as light)
    actionText: '#202c39',      // gunmetal (same as light - boxes don't invert)
    
    // Sage accents - Stay consistent
    sage: '#b8b08d',            // sage
    sageDark: '#78704b',        // sage-300
    sageLight: '#d5d0bb',       // sage-700
    
    // Card colors
    card: '#283845',            // secondary
    cardBorder: '#456077',      // secondary-600
    
    // Status colors (keep same)
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

export type Theme = typeof theme.light;

export const getTheme = (isDarkMode: boolean): Theme => {
  return isDarkMode ? theme.dark : theme.light;
};
