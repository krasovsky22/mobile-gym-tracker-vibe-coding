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

  const updateSet = useMutation(api.trackedWorkoutExerciseSets.update);

  if (!trackedWorkout || !exercise) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Loading exercise...</ThemedText>
      </ThemedView>
    );
  }

  // Get the tracked exercise for this exercise
  const trackedExercise = trackedWorkout.trackedExercises?.find(
    (te) => te.exerciseId === exerciseId
  );

  const handleUpdateSet = async (
    setId: Id<'trackedWorkoutExerciseSets'>,
    field: 'weight' | 'reps',
    value: string
  ) => {
    if (!value) return;

    // Find the current set to get its isCompleted status
    const set = trackedExercise?.sets.find((s) => s._id === setId);
    if (!set) return;

    try {
      await updateSet({
        id: setId,
        isCompleted: set.isCompleted,
        [field]: field === 'weight' ? parseFloat(value) : parseInt(value, 10),
      });
    } catch (err) {
      console.error(`Error updating set ${field}:`, err);
      error(`Failed to update set ${field}`);
    }
  };

  const handleToggleSetComplete = async (setId: Id<'trackedWorkoutExerciseSets'>) => {
    const set = trackedExercise?.sets.find((s) => s._id === setId);
    if (!set) return;

    try {
      await updateSet({
        id: setId,
        isCompleted: !set.isCompleted,
      });
    } catch (err) {
      console.error('Error updating set:', err);
      error('Failed to update set');
    }
  };

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

            <ThemedView className="p-4">
              <ThemedText className="mb-4 text-lg font-semibold">Sets</ThemedText>

              {trackedExercise?.sets.map((set) => (
                <ThemedView key={set._id} className="mb-2 rounded-lg border border-gray-200 p-4">
                  <ThemedView className="mb-2 flex-row items-center justify-between">
                    <ThemedText className="text-lg font-semibold">Set {set.setNumber}</ThemedText>
                    <ThemedButton
                      variant={set.isCompleted ? 'secondary' : 'primary'}
                      onPress={() => handleToggleSetComplete(set._id)}>
                      {set.isCompleted ? 'Completed' : 'Complete'}
                    </ThemedButton>
                  </ThemedView>
                  <ThemedView className="flex-row space-x-4">
                    <ThemedView className="flex-1">
                      <ThemedText className="mb-2 text-gray-600">Weight (kg)</ThemedText>
                      <ThemedTextInput
                        value={set.weight.toString()}
                        onChangeText={(value) => handleUpdateSet(set._id, 'weight', value)}
                        keyboardType="numeric"
                        placeholder="Enter weight"
                      />
                    </ThemedView>
                    <ThemedView className="flex-1">
                      <ThemedText className="mb-2 text-gray-600">Reps</ThemedText>
                      <ThemedTextInput
                        value={set.reps.toString()}
                        onChangeText={(value) => handleUpdateSet(set._id, 'reps', value)}
                        keyboardType="numeric"
                        placeholder="Enter reps"
                      />
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
