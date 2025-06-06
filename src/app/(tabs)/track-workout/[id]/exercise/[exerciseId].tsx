import { api } from 'convex/_generated/api';
import { Id, Doc } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedTextInput, ThemedView, ThemedCheckbox } from '~/theme';

// Swipeable Set Row Component
function SwipeableSetRow({
  set,
  onUpdateSet,
  onToggleComplete,
  onRemove,
}: {
  set: Doc<'trackedWorkoutExerciseSets'>;
  onUpdateSet: (
    setId: Id<'trackedWorkoutExerciseSets'>,
    field: 'weight' | 'reps',
    value: string
  ) => void;
  onToggleComplete: (setId: Id<'trackedWorkoutExerciseSets'>) => void;
  onRemove: (setId: Id<'trackedWorkoutExerciseSets'>) => void;
}) {
  const translateX = useSharedValue(0);
  const [showDelete, setShowDelete] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow left swipe (negative translation)
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -80);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -40) {
        // Show delete button
        translateX.value = withTiming(-80, { duration: 200 });
        runOnJS(setShowDelete)(true);
      } else {
        // Snap back
        translateX.value = withTiming(0, { duration: 200 });
        runOnJS(setShowDelete)(false);
      }
    });

  const handleDelete = () => {
    onRemove(set._id);
    // Reset position
    translateX.value = 0;
    setShowDelete(false);
  };

  return (
    <ThemedView className="relative mb-2">
      {/* Delete button background */}
      {showDelete && (
        <ThemedView className="absolute top-0 bottom-0 right-0 flex items-center justify-center w-20 bg-red-500 rounded-r-lg">
          <ThemedButton
            variant="danger"
            size="sm"
            onPress={handleDelete}
            className="bg-transparent">
            <ThemedText className="text-xs text-white">Delete</ThemedText>
          </ThemedButton>
        </ThemedView>
      )}

      {/* Main content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle} className="rounded-lg ">
          <ThemedView className="flex-row items-center justify-between gap-3 p-2 rounded-lg">
            <ThemedText className="mt-4 text-lg font-semibold">{set.setNumber}.</ThemedText>

            <ThemedView className="flex-row flex-1 gap-3 mb-2 space-x-4">
              <ThemedView className="flex-1">
                <ThemedText className="mb-2 text-neutral-600">Weight (kg)</ThemedText>
                <ThemedTextInput
                  className=""
                  value={set.weight.toString()}
                  onChangeText={(value) => onUpdateSet(set._id, 'weight', value)}
                  keyboardType="numeric"
                  placeholder="Enter weight"
                />
              </ThemedView>
              <ThemedView className="flex-1">
                <ThemedText className="mb-2 text-neutral-600">Reps</ThemedText>
                <ThemedTextInput
                  value={set.reps.toString()}
                  onChangeText={(value) => onUpdateSet(set._id, 'reps', value)}
                  keyboardType="numeric"
                  placeholder="Enter reps"
                />
              </ThemedView>
            </ThemedView>

            <ThemedCheckbox
              checked={set.isCompleted}
              onPress={() => onToggleComplete(set._id)}
              className="mt-4"
            />
          </ThemedView>
        </Animated.View>
      </GestureDetector>
    </ThemedView>
  );
}

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
  const deleteSet = useMutation(api.trackedWorkoutExerciseSets.remove);

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
                <ThemedButton variant="primary" onPress={handleNextExerciseClick}>
                  Next Exercise
                </ThemedButton>
              </ThemedView>
            </ScrollView>
          </SafeAreaView>
        </ThemedView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
