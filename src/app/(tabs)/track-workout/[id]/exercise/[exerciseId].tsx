import { api } from 'convex/_generated/api';
import { Id, Doc } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SwipeableSetRow } from '~/components';
import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedView } from '~/theme';

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

  // Fetch the tracked workout to get workout details
  const trackedWorkout = useQuery(
    api.trackedWorkouts.get,
    trackedWorkoutExercise ? { id: trackedWorkoutExercise.trackedWorkoutId } : 'skip'
  );

  const updateSet = useMutation(api.trackedWorkoutExerciseSets.update);
  const createSet = useMutation(api.trackedWorkoutExerciseSets.create);
  const deleteSet = useMutation(api.trackedWorkoutExerciseSets.remove);
  const updateExerciseStatus = useMutation(api.trackedWorkoutExercises.updateStatus);
  const moveToNextExercise = useMutation(api.trackedWorkoutExercises.moveToNextExercise);

  // Local state for sets
  const [localSets, setLocalSets] = useState<Doc<'trackedWorkoutExerciseSets'>[]>([]);
  // Track sets that need to be saved
  const [pendingSaves, setPendingSaves] = useState<Set<Id<'trackedWorkoutExerciseSets'>>>(
    new Set()
  );

  // Initialize local sets when data is loaded
  useEffect(() => {
    if (trackedWorkoutExercise?.sets) {
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
      <ThemedView className="items-center justify-center flex-1">
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

  const handleRemoveSet = async (setId: Id<'trackedWorkoutExerciseSets'>) => {
    // Remove from local state first for immediate UI feedback
    setLocalSets((prevSets) => prevSets.filter((set) => set._id !== setId));

    try {
      await deleteSet({ id: setId });

      // Re-number the remaining sets in local state
      setLocalSets((prevSets) =>
        prevSets.map((set, index) => ({
          ...set,
          setNumber: index + 1,
        }))
      );
    } catch (err) {
      console.error('Error removing set:', err);
      error('Failed to remove set');

      // Revert local state on error by reloading from server
      if (trackedWorkoutExercise?.sets) {
        setLocalSets(trackedWorkoutExercise.sets);
      }
    }
  };

  const handleToggleSetComplete = async (setId: Id<'trackedWorkoutExerciseSets'>) => {
    const set = localSets.find((s) => s._id === setId);
    if (!set) return;

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

      return;
    }

    const newLocalSets = localSets.map((s) =>
      s._id === setId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    // Update local state first
    setLocalSets(newLocalSets);

    // if all sets are completed, mark exercise as completed
    const allSetsCompleted = newLocalSets.every((s) => s.isCompleted);
    if (allSetsCompleted) {
      try {
        await updateExerciseStatus({
          id: trackedWorkoutExercise._id,
          status: 'completed',
        });
      } catch (err) {
        console.error('Error marking exercise as completed:', err);
        error('Failed to mark exercise as completed');
      }
    }
  };

  const moveToNextExerciseHandler = async () => {
    await peristPendingSaves();

    if (!trackedWorkoutExercise) return;

    const nextTrackedExerciseId = await moveToNextExercise({
      trackedWorkoutId: trackedWorkoutExercise.trackedWorkoutId,
      currentExerciseId: trackedWorkoutExercise._id,
    });

    // its the last exercise, so we don't have a next one
    if (!nextTrackedExerciseId) {
      // navigate to track workout page
      router.push({
        pathname: '/track-workout/[id]/track',
        params: {
          id: trackedWorkoutExercise.trackedWorkoutId,
        },
      });

      return;
    }

    // Navigate back to track workout page to let it handle the next exercise logic
    router.push({
      pathname: '/track-workout/[id]/exercise/[exerciseId]',
      params: { id: trackedWorkoutExercise.trackedWorkoutId, exerciseId: nextTrackedExerciseId },
    });
  };

  // Helper function to check if this is the last exercise in the workout
  const isLastExerciseInWorkout = () => {
    if (!trackedWorkout?.workout?.exercises || !trackedWorkoutExercise) return false;

    const workoutExercises = trackedWorkout.workout.exercises;
    const currentExerciseIndex = workoutExercises.findIndex(
      (ex: any) => ex.exerciseId === trackedWorkoutExercise.exerciseId
    );

    return currentExerciseIndex === workoutExercises.length - 1;
  };

  // Helper function to get the appropriate button text
  const getNextButtonText = () => {
    const isLastExercise = isLastExerciseInWorkout();
    const isCompleted = trackedWorkoutExercise?.status === 'completed';
    const allSetsCompleted = localSets.every((s) => s.isCompleted);

    if (isLastExercise) {
      if (isCompleted) {
        return 'Complete Workout';
      }
      return allSetsCompleted ? 'Complete Workout' : 'Complete Workout (Sets Incomplete)';
    }

    if (isCompleted) {
      return 'Continue to Next Exercise';
    }
    return allSetsCompleted ? 'Next Exercise' : 'Next Exercise (Sets Incomplete)';
  };

  const handleNextExerciseClick = async () => {
    const allSetsCompleted = localSets.every((s) => s.isCompleted);
    const isLastExercise = isLastExerciseInWorkout();

    if (!allSetsCompleted) {
      const message = isLastExercise ? 'Complete workout?' : 'Move to next exercise?';
      const description = isLastExercise
        ? 'Not all sets are completed. You can always come back to finish this exercise later.'
        : 'Not all sets are completed. You can always come back to finish this exercise.';

      confirm(message, description, moveToNextExerciseHandler);
    } else {
      await moveToNextExerciseHandler();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemedView className="flex-1">
          <SafeAreaView className="flex-1">
            <ThemedView className="flex-row items-center p-4 border-b border-neutral-200">
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

                <ThemedView className="flex-1 p-4 mb-2 border rounded-lg border-neutral-200">
                  {localSets.map((set) => (
                    <SwipeableSetRow
                      key={set._id}
                      set={set}
                      onUpdateSet={handleUpdateSet}
                      onToggleComplete={handleToggleSetComplete}
                      onRemove={handleRemoveSet}
                    />
                  ))}
                  <ThemedButton
                    className="ml-auto w-[120px]"
                    variant="secondary"
                    icon="add"
                    onPress={() => handleAddSet()}>
                    Add Set
                  </ThemedButton>
                </ThemedView>
                <ThemedButton
                  variant={trackedWorkoutExercise.status === 'completed' ? 'success' : 'primary'}
                  onPress={handleNextExerciseClick}>
                  {getNextButtonText()}
                </ThemedButton>
              </ThemedView>
            </ScrollView>
          </SafeAreaView>
        </ThemedView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
