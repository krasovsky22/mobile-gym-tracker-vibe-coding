import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

import { ThemedText } from './Text';

interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary: {
    container: 'bg-blue-500',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-neutral-500 dark:bg-gray-800',
    text: 'text-gray-900 dark:text-gray-100',
  },
  danger: {
    container: 'bg-red-500',
    text: 'text-white',
  },
  success: {
    container: 'bg-green-500',
    text: 'text-white',
  },
  warning: {
    container: 'bg-orange-500',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
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
  icon,
  iconPosition = 'left',
  ...props
}: ThemedButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  // Get icon color based on variant
  const getIconColor = () => {
    if (disabled) return '#9ca3af';
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#374151'; // gray-700
      case 'danger':
        return '#ffffff';
      case 'success':
        return '#ffffff';
      case 'warning':
        return '#ffffff';
      case 'outline':
        return '#374151'; // gray-700
      default:
        return '#ffffff';
    }
  };

  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 20;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const renderContent = () => {
    if (!icon) {
      return (
        <ThemedText
          className={`font-semibold ${variantStyle.text} ${sizeStyle.text} ${
            fullWidth ? 'text-center' : ''
          }`}>
          {children}
        </ThemedText>
      );
    }

    return (
      <View className={`flex-row items-center ${fullWidth ? 'justify-center' : ''}`}>
        {iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={getIconColor()}
            style={{ marginRight: 8 }}
          />
        )}
        <ThemedText className={`font-semibold ${variantStyle.text} ${sizeStyle.text}`}>
          {children}
        </ThemedText>
        {iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={getIconColor()}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      className={`rounded-lg ${variantStyle.container} ${sizeStyle.container} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-50' : ''} ${className}`}
      disabled={disabled}
      {...props}>
      {renderContent()}
    </TouchableOpacity>
  );
}
