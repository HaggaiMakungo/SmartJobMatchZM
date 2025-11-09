import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = ({ 
  children, 
  variant = 'default',
  className, 
  ...props 
}: CardProps) => {
  const variantStyles = {
    default: 'bg-white shadow-sm border border-sage-200',
    outlined: 'bg-transparent border-2 border-sage-300',
    elevated: 'bg-white shadow-lg border border-sage-100',
  };

  return (
    <View 
      className={cn(
        'rounded-xl p-4',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};
