import React from 'react';
import { TextInput, Text, View, TextInputProps, StyleSheet } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = ({ 
  label, 
  error, 
  helperText,
  leftIcon,
  rightIcon,
  style,
  ...props 
}: InputProps) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      
      <View 
        style={[
          styles.inputContainer,
          error ? styles.inputError : styles.inputNormal,
          props.editable === false && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#b8b08d"
          {...props}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#283845', // secondary
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  inputNormal: {
    borderColor: '#5c7fa4', // sage-700
  },
  inputError: {
    borderColor: '#f29559', // tangerine
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0, // Remove default padding
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#f29559', // tangerine
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#b8b08d', // sage-500
    marginTop: 4,
  },
});
