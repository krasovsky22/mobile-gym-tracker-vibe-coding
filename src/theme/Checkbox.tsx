import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { ThemedText } from './Text';
import { useTheme } from '../context/theme';

interface ThemedCheckboxProps extends Omit<TouchableOpacityProps, 'onPress'> {
  checked: boolean;
  onPress: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    iconSize: 20,
    textClass: 'text-sm',
  },
  md: {
    iconSize: 24,
    textClass: 'text-base',
  },
  lg: {
    iconSize: 28,
    textClass: 'text-lg',
  },
};

export function ThemedCheckbox({
  checked,
  onPress,
  label,
  size = 'md',
  className = '',
  ...props
}: ThemedCheckboxProps) {
  const { isDarkMode } = useTheme();
  const sizeStyle = sizeStyles[size];

  const getIconColor = () => {
    if (checked) {
      return '#22c55e'; // green-500
    }
    return isDarkMode ? '#9ca3af' : '#6b7280'; // gray-400/500
  };

  const getTextColor = () => {
    if (checked) {
      return isDarkMode ? 'text-green-300' : 'text-green-600';
    }
    return 'text-gray-600';
  };

  return (
    <TouchableOpacity className={`flex-row items-center ${className}`} onPress={onPress} {...props}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={sizeStyle.iconSize}
        color={getIconColor()}
      />
      {label && (
        <ThemedText className={`ml-2 ${getTextColor()} ${sizeStyle.textClass}`}>{label}</ThemedText>
      )}
    </TouchableOpacity>
  );
}
