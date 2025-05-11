import { View } from 'react-native';

import { ProtectedRoute } from '~/components/ProtectedRoute';
import { ThemedText, ThemedView } from '~/theme';

export default function TrackWorkoutScreen() {
  return (
    <ProtectedRoute>
      <ThemedView className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center p-6">
          <ThemedText className="mb-4 text-center text-3xl font-bold text-neutral-900">
            Track Workout
          </ThemedText>
          <ThemedText className="text-center text-neutral-600">
            Start tracking your workout
          </ThemedText>
        </View>
      </ThemedView>
    </ProtectedRoute>
  );
}
