import { useAuthActions } from '@convex-dev/auth/react';
import { TouchableOpacity } from 'react-native';

import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';

export default function HomeScreen() {
  const { signOut } = useAuthActions();

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText className="mb-4 text-2xl font-bold">Welcome to Gym Tracker</ThemedText>
        <ThemedText className="mb-8 text-center text-neutral-500">
          Track your workouts and achieve your fitness goals
        </ThemedText>
      </ThemedView>

      <TouchableOpacity className="rounded-lg bg-red-500 p-4" onPress={signOut}>
        <ThemedText className="text-center font-semibold text-white">Sign Out</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
