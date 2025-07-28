import { ActivityIndicator } from 'react-native';

import { ThemedText, ThemedView } from '~/theme';

interface LoadingProps {
  size?: 'small' | 'large';
  text?: string;
  className?: string;
}

export default function Loading({
  size = 'large',
  text = 'Loading...',
  className = '',
}: LoadingProps) {
  return (
    <ThemedView className={`flex-1 items-center justify-center p-4 ${className}`}>
      <ActivityIndicator size={size} className="mb-2" />
      <ThemedText className="text-neutral-500">{text}</ThemedText>
    </ThemedView>
  );
}
