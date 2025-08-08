import { api } from 'convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedView } from '~/theme';

export default function ContinueWorkoutBanner() {
  const router = useRouter();
  const { confirm, error } = useAlert();
  const deleteTrackedWorkout = useMutation(api.trackedWorkouts.remove);
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

  const handleDelete = async () => {
    confirm('Delete Workout', 'Are you sure you want to delete this workout?', async () => {
      try {
        await deleteTrackedWorkout({ id: currentInProgressWorkout._id });
      } catch (err) {
        console.error('Error deleting workout:', err);
        error('Failed to delete workout');
      }
    });

    console.log('Deleting current in-progress workout:', currentInProgressWorkout._id);
  };

  return (
    <ThemedView>
      <ThemedText className="mb-6 text-2xl font-bold text-center text-neutral-900">
        Continue Workout
      </ThemedText>
      <TouchableOpacity onPress={handleContinue} className="mb-6">
        <ThemedView className="p-4 border-2 border-blue-500 rounded-lg shadow-sm bg-blue-50">
          <View className="flex-row items-center justify-between mb-2">
            <ThemedText className="text-lg font-bold text-blue-900">Continue Workout</ThemedText>
            <ThemedText className="text-sm text-blue-700">
              {formatElapsedTime(currentInProgressWorkout.startTime)}
            </ThemedText>
          </View>

          <ThemedText className="mb-2 text-base font-semibold text-blue-800">
            {currentInProgressWorkout.workout.name}
          </ThemedText>

          <View className="flex-row items-center justify-between mb-3">
            <ThemedText className="text-sm text-blue-700">
              {currentInProgressWorkout.completedExercises} of{' '}
              {currentInProgressWorkout.totalExercises} exercises completed
            </ThemedText>
            <ThemedText className="text-sm font-medium text-blue-700">
              {currentInProgressWorkout.completionPercentage}%
            </ThemedText>
          </View>

          {/* Progress Bar */}
          <View className="h-2 mb-3 overflow-hidden bg-blue-200 rounded-full">
            <View
              className="h-full transition-all duration-300 bg-blue-500"
              style={{ width: `${currentInProgressWorkout.completionPercentage}%` }}
            />
          </View>

          <ThemedView className="flex-row justify-between w-full gap-1 space-between">
            <ThemedButton
              variant="primary"
              size="md"
              onPress={handleContinue}
              className="bg-blue-600">
              <ThemedText className="font-semibold text-white">Continue Workout</ThemedText>
            </ThemedButton>

            <ThemedButton variant="danger" size="md" onPress={handleDelete} className="bg-blue-600">
              <ThemedText className="font-semibold text-white">Delete</ThemedText>
            </ThemedButton>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
}
