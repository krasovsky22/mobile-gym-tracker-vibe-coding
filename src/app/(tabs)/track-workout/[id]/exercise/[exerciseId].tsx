import { api } from 'convex/_generated/api';
import { Id, Doc } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
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

  const trackedWorkoutExercise = useQuery(api.trackedWorkoutExercises.get, {
    id: exerciseId as Id<'trackedWorkoutExercises'>,
  });
  // Local state for sets
  const [localSets, setLocalSets] = useState<Doc<'trackedWorkoutExerciseSets'>[]>([]);

  // Initialize local sets when data is loaded
  useEffect(() => {
    if (trackedWorkoutExercise?.sets) {
      setLocalSets(trackedWorkoutExercise.sets);
    }
  }, [trackedWorkoutExercise?.sets]);

  const updateSet = useMutation(api.trackedWorkoutExerciseSets.update);

  if (!trackedWorkoutExercise) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Loading exercise...</ThemedText>
      </ThemedView>
    );
  }

  const handleUpdateSet = (
    setId: Id<'trackedWorkoutExerciseSets'>,
    field: 'weight' | 'reps',
    value: string
  ) => {
    if (!value) return;

    setLocalSets((prevSets) =>
      prevSets.map((set) =>
        set._id === setId
          ? {
              ...set,
              [field]: field === 'weight' ? parseFloat(value) : parseInt(value, 10),
            }
          : set
      )
    );
  };

  const handleSaveChanges = async (setId: Id<'trackedWorkoutExerciseSets'>) => {
    const set = localSets.find((s) => s._id === setId);
    if (!set) return;

    try {
      await updateSet({
        id: setId,
        weight: set.weight,
        reps: set.reps,
        isCompleted: set.isCompleted,
      });
    } catch (err) {
      console.error('Error saving set:', err);
      error('Failed to save set');
    }
  };

  const handleToggleSetComplete = async (setId: Id<'trackedWorkoutExerciseSets'>) => {
    const set = localSets.find((s) => s._id === setId);
    if (!set) return;

    // Update local state first
    setLocalSets((prevSets) =>
      prevSets.map((s) => (s._id === setId ? { ...s, isCompleted: !s.isCompleted } : s))
    );

    // Then persist to database
    try {
      await updateSet({
        id: setId,
        isCompleted: !set.isCompleted,
        weight: set.weight,
        reps: set.reps,
      });
    } catch (err) {
      console.error('Error updating set:', err);
      error('Failed to update set');

      // Revert local state on error
      setLocalSets((prevSets) =>
        prevSets.map((s) => (s._id === setId ? { ...s, isCompleted: set.isCompleted } : s))
      );
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
            <ThemedText className="text-xl font-semibold">
              {trackedWorkoutExercise.exercise.name}
            </ThemedText>
          </ThemedView>

          <ScrollView className="flex-1">
            <ThemedView className="p-4">
              <ThemedText className="text-lg font-semibold">Exercise Details</ThemedText>
              <ThemedText className="text-gray-600">
                Muscle Group: {trackedWorkoutExercise.exercise.muscleGroup}
              </ThemedText>
              <ThemedText className="text-gray-600">
                Category: {trackedWorkoutExercise.exercise.category}
              </ThemedText>
            </ThemedView>

            <ThemedView className="p-4">
              <ThemedText className="mb-4 text-lg font-semibold">Sets</ThemedText>

              {localSets.map((set) => (
                <ThemedView key={set._id} className="mb-2 rounded-lg border border-gray-200 p-4">
                  <ThemedView className="mb-2 flex-row items-center justify-between">
                    <ThemedText className="text-lg font-semibold">Set {set.setNumber}</ThemedText>
                    <ThemedButton
                      variant={set.isCompleted ? 'secondary' : 'primary'}
                      onPress={() => handleToggleSetComplete(set._id)}>
                      {set.isCompleted ? 'Completed' : 'Complete'}
                    </ThemedButton>
                  </ThemedView>
                  <ThemedView className="mb-2 flex-row space-x-4">
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
                  <ThemedButton variant="secondary" onPress={() => handleSaveChanges(set._id)}>
                    Save Changes
                  </ThemedButton>
                </ThemedView>
              ))}
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
