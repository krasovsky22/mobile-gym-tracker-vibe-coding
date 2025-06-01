import { api } from 'convex/_generated/api';
import { Id, Doc } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedTextInput, ThemedView, ThemedCheckbox } from '~/theme';

export default function TrackExerciseScreen() {
  const router = useRouter();
  const { error, confirm } = useAlert();
  const { exerciseId } = useLocalSearchParams<{
    id: string;
    exerciseId: string;
  }>();

  const trackedWorkoutExercise = useQuery(api.trackedWorkoutExercises.get, {
    id: exerciseId as Id<'trackedWorkoutExercises'>,
  });

  const updateSet = useMutation(api.trackedWorkoutExerciseSets.update);
  const createSet = useMutation(api.trackedWorkoutExerciseSets.create);
  const createTrackedExercise = useMutation(api.trackedWorkoutExercises.create);

  // Local state for sets
  const [localSets, setLocalSets] = useState<Doc<'trackedWorkoutExerciseSets'>[]>([]);
  // Track sets that need to be saved
  const [pendingSaves, setPendingSaves] = useState<Set<Id<'trackedWorkoutExerciseSets'>>>(
    new Set()
  );

  // Initialize local sets when data is loaded
  useEffect(() => {
    if (trackedWorkoutExercise?.sets) {
      console.log('loaded sets:', trackedWorkoutExercise.sets);
      setLocalSets(trackedWorkoutExercise.sets);
    }
  }, [trackedWorkoutExercise?.sets]);

  const peristPendingSaves = async () => {
    if (pendingSaves.size === 0) return;

    const setsToSave = Array.from(pendingSaves);

    for (const setId of setsToSave) {
      const set = localSets.find((s) => s._id === setId);
      if (set) {
        try {
          await updateSet({
            id: setId,
            weight: set.weight,
            reps: set.reps,
            isCompleted: set.isCompleted,
          });
        } catch (err) {
          console.error('Error auto-saving set:', err);
          // Don't show error for auto-save failures to avoid disrupting the user
        }
      }
    }
  };

  // Auto-save pending changes after 2 seconds of inactivity
  useEffect(() => {
    if (pendingSaves.size === 0) return;

    const timeoutId = setTimeout(async () => {
      peristPendingSaves();
      setPendingSaves(new Set());
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [pendingSaves, localSets, updateSet]);

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

    // Mark this set as needing to be saved
    setPendingSaves((prev) => new Set(prev).add(setId));
  };

  const handleAddSet = async () => {
    if (!trackedWorkoutExercise) return;

    try {
      const newSetNumber = localSets.length + 1;
      const newSetId = await createSet({
        trackedWorkoutExerciseId: trackedWorkoutExercise._id,
        setNumber: newSetNumber,
        weight: 0,
        reps: 0,
        isCompleted: false,
      });

      // Add the new set to local state (we'll get it from the next query refresh)
      // For now, create a placeholder that matches the expected structure
      const newSet: Doc<'trackedWorkoutExerciseSets'> = {
        _id: newSetId,
        _creationTime: Date.now(),
        trackedWorkoutExerciseId: trackedWorkoutExercise._id,
        setNumber: newSetNumber,
        weight: 0,
        reps: 0,
        isCompleted: false,
        userId: trackedWorkoutExercise.userId, // Use the same userId as the parent exercise
      };

      setLocalSets((prevSets) => [...prevSets, newSet]);
    } catch (err) {
      console.error('Error adding set:', err);
      error('Failed to add set');
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

  const moveToNextExercise = async () => {
    await peristPendingSaves();
  };

  const handleNextExerciseClick = async () => {
    confirm(
      'Are you sure you want to move to the next exercise?',
      'Not all sets are completed.',
      moveToNextExercise
    );
  };

  return (
    <SafeAreaProvider>
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          <ThemedView className="flex-row items-center border-b border-neutral-200 p-4">
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

          <ScrollView className="flex-1" contentContainerStyle={{ flex: 1 }}>
            <ThemedView className="p-4">
              <ThemedText className="text-lg font-semibold">Exercise Details</ThemedText>
              <ThemedText className="text-neutral-600">
                Muscle Group: {trackedWorkoutExercise.exercise.muscleGroup}
              </ThemedText>
              <ThemedText className="text-neutral-600">
                Category: {trackedWorkoutExercise.exercise.category}
              </ThemedText>
            </ThemedView>

            <ThemedView className="flex-1 p-4">
              <ThemedText className="mb-4 text-lg font-semibold">Sets</ThemedText>

              <ThemedView className="mb-2 flex-1 rounded-lg border border-neutral-200 p-4">
                {localSets.map((set) => (
                  <ThemedView
                    className="mb-2 flex-row items-center justify-between gap-3"
                    key={set._id}>
                    <ThemedText className="mt-4 text-lg font-semibold">{set.setNumber}.</ThemedText>

                    <ThemedView className="mb-2 flex-1 flex-row gap-3 space-x-4">
                      <ThemedView className="flex-1">
                        <ThemedText className="mb-2 text-neutral-600">Weight (kg)</ThemedText>
                        <ThemedTextInput
                          className=""
                          value={set.weight.toString()}
                          onChangeText={(value) => handleUpdateSet(set._id, 'weight', value)}
                          keyboardType="numeric"
                          placeholder="Enter weight"
                        />
                      </ThemedView>
                      <ThemedView className="flex-1">
                        <ThemedText className="mb-2 text-neutral-600">Reps</ThemedText>
                        <ThemedTextInput
                          value={set.reps.toString()}
                          onChangeText={(value) => handleUpdateSet(set._id, 'reps', value)}
                          keyboardType="numeric"
                          placeholder="Enter reps"
                        />
                      </ThemedView>
                    </ThemedView>

                    <ThemedCheckbox
                      checked={set.isCompleted}
                      onPress={() => handleToggleSetComplete(set._id)}
                      className="mt-4"
                    />
                  </ThemedView>
                ))}
                <ThemedButton
                  className="ml-auto w-[120px]"
                  variant="secondary"
                  icon="add"
                  onPress={() => handleAddSet()}>
                  Add Set
                </ThemedButton>
              </ThemedView>
              <ThemedButton variant="primary" onPress={handleNextExerciseClick}>
                Next Exercise
              </ThemedButton>
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
