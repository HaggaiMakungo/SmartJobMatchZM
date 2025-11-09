import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tangerine';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  children,
  disabled,
  style,
  ...props 
}: ButtonProps) => {
  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: '#202c39' }, // Gunmetal
    secondary: { backgroundColor: '#283845' }, // Lighter gunmetal
    tangerine: { backgroundColor: '#f29559' }, // Energetic orange
    outline: { 
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#b8b08d' // Sage
    },
    ghost: { backgroundColor: 'transparent' },
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const textSizes: Record<string, number> = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const textColors: Record<string, string> = {
    primary: '#f2d492', // Peach
    secondary: '#f5dca7', // Lighter peach
    tangerine: '#FFFFFF', // White
    outline: '#b8b08d', // Sage
    ghost: '#b8b08d', // Sage
  };

  const loaderColors: Record<string, string> = {
    primary: '#f2d492',
    secondary: '#f5dca7',
    tangerine: '#FFFFFF',
    outline: '#b8b08d',
    ghost: '#b8b08d',
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || isLoading) && styles.disabled,
        style
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={loaderColors[variant]} />
      ) : (
        typeof children === 'string' ? (
          <Text style={[
            styles.text,
            { fontSize: textSizes[size], color: textColors[variant] }
          ]}>
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
});
