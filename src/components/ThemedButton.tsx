import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { ThemedText } from './ThemedText';

interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary: {
    container: 'bg-blue-500',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  danger: {
    container: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-300',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-3 py-2',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-2',
    text: 'text-base',
  },
  lg: {
    container: 'px-4 py-3',
    text: 'text-lg',
  },
};

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ThemedButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      className={`rounded-lg ${variantStyle.container} ${sizeStyle.container} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-50' : ''} ${className}`}
      disabled={disabled}
      {...props}>
      <ThemedText
        className={`font-semibold ${variantStyle.text} ${sizeStyle.text} ${
          fullWidth ? 'text-center' : ''
        }`}>
        {children}
      </ThemedText>
    </TouchableOpacity>
  );
}
