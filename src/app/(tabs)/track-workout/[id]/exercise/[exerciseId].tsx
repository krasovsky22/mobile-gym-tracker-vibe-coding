import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedTextInput, ThemedView } from '~/theme';

export default function TrackExerciseScreen() {
  const router = useRouter();
  const { error } = useAlert();
  const { id, exerciseId } = useLocalSearchParams<{
    id: string;
    exerciseId: string;
  }>();

  // Get tracked workout exercise and exercise details
  const trackedWorkout = useQuery(api.trackedWorkouts.get, {
    id: id as Id<'trackedWorkouts'>,
  });

  const exercise = useQuery(api.exercises.get, { id: exerciseId as Id<'exercises'> });

  if (!trackedWorkout || !exercise) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Loading exercise...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          <ThemedView className="flex-row items-center border-b border-gray-200 p-4">
            <ThemedButton
              variant="secondary"
              size="md"
              className="mr-4"
              onPress={() => router.back()}>
              Back
            </ThemedButton>
            <ThemedText className="text-xl font-semibold">{exercise.name}</ThemedText>
          </ThemedView>

          <ScrollView className="flex-1">
            <ThemedView className="p-4">
              <ThemedText className="text-lg font-semibold">Exercise Details</ThemedText>
              <ThemedText className="text-gray-600">
                Muscle Group: {exercise.muscleGroup}
              </ThemedText>
              <ThemedText className="text-gray-600">Category: {exercise.category}</ThemedText>
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
