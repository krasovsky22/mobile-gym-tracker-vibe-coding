import { Doc, Id } from 'convex/_generated/dataModel';
import { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { ThemedButton, ThemedText, ThemedTextInput, ThemedView, ThemedCheckbox } from '~/theme';

interface SwipeableSetRowProps {
  set: Doc<'trackedWorkoutExerciseSets'>;
  onUpdateSet: (
    setId: Id<'trackedWorkoutExerciseSets'>,
    field: 'weight' | 'reps',
    value: string
  ) => void;
  onToggleComplete: (setId: Id<'trackedWorkoutExerciseSets'>) => void;
  onRemove: (setId: Id<'trackedWorkoutExerciseSets'>) => void;
}

export function SwipeableSetRow({
  set,
  onUpdateSet,
  onToggleComplete,
  onRemove,
}: SwipeableSetRowProps) {
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
        <ThemedView className="absolute bottom-0 right-0 top-0 flex w-20 items-center justify-center rounded-r-lg bg-red-500">
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
        <Animated.View style={animatedStyle} className="rounded-lg">
          <ThemedView className="flex-row items-center justify-between gap-3 rounded-lg p-2">
            <ThemedText className="mt-4 text-lg font-semibold">{set.setNumber}.</ThemedText>

            <ThemedView className="mb-2 flex-1 flex-row gap-3 space-x-4">
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
