import { api } from 'convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

import { ThemedButton, ThemedText, ThemedView } from '~/theme';

export default function ContinueWorkoutBanner() {
  const router = useRouter();
  const currentInProgressWorkout = useQuery(api.trackedWorkouts.getCurrentInProgress);

  // Don't render anything if there's no in-progress workout
  if (!currentInProgressWorkout) {
    return null;
  }

  const formatElapsedTime = (startTime: number) => {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  const handleContinue = () => {
    router.push({
      pathname: `/track-workout/${currentInProgressWorkout._id}/track`,
    });
  };

  return (
    <ThemedView>
      <ThemedText className="mb-6 text-center text-2xl font-bold text-neutral-900">
        Continue Workout
      </ThemedText>
      <TouchableOpacity onPress={handleContinue} className="mb-6">
        <ThemedView className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4 shadow-sm">
          <View className="mb-2 flex-row items-center justify-between">
            <ThemedText className="text-lg font-bold text-blue-900">Continue Workout</ThemedText>
            <ThemedText className="text-sm text-blue-700">
              {formatElapsedTime(currentInProgressWorkout.startTime)}
            </ThemedText>
          </View>

          <ThemedText className="mb-2 text-base font-semibold text-blue-800">
            {currentInProgressWorkout.workout.name}
          </ThemedText>

          <View className="mb-3 flex-row items-center justify-between">
            <ThemedText className="text-sm text-blue-700">
              {currentInProgressWorkout.completedExercises} of{' '}
              {currentInProgressWorkout.totalExercises} exercises completed
            </ThemedText>
            <ThemedText className="text-sm font-medium text-blue-700">
              {currentInProgressWorkout.completionPercentage}%
            </ThemedText>
          </View>

          {/* Progress Bar */}
          <View className="mb-3 h-2 overflow-hidden rounded-full bg-blue-200">
            <View
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${currentInProgressWorkout.completionPercentage}%` }}
            />
          </View>

          <ThemedButton
            variant="primary"
            size="md"
            onPress={handleContinue}
            className="bg-blue-600">
            <ThemedText className="font-semibold text-white">Continue Workout</ThemedText>
          </ThemedButton>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
}
