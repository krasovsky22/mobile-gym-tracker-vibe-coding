import React from 'react';

import { ThemedText } from './Text';
import { ThemedView } from './View';

type BadgeVariant = 'info' | 'neutral' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary';

type BadgeSize = 'sm' | 'md';

interface ThemedBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  info: {
    container: 'bg-blue-100',
    text: 'text-blue-800',
  },
  neutral: {
    container: 'bg-neutral-100',
    text: 'text-neutral-800',
  },
  success: {
    container: 'bg-green-100',
    text: 'text-green-800',
  },
  warning: {
    container: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  danger: {
    container: 'bg-red-100',
    text: 'text-red-800',
  },
  primary: {
    container: 'bg-primary-100',
    text: 'text-primary-800',
  },
  secondary: {
    container: 'bg-secondary-100 dark:bg-secondary-900/40',
    text: 'text-secondary-800 dark:text-secondary-200',
  },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string }> = {
  sm: {
    container: 'px-2 py-1',
    text: 'text-xs',
  },
  md: {
    container: 'px-2.5 py-1.5',
    text: 'text-sm',
  },
};

export function ThemedBadge({
  variant = 'neutral',
  size = 'sm',
  className = '',
  children,
}: ThemedBadgeProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <ThemedView className={`rounded-full ${v.container} ${s.container} ${className}`}>
      <ThemedText className={`font-medium ${v.text} ${s.text}`}>{children}</ThemedText>
    </ThemedView>
  );
}
