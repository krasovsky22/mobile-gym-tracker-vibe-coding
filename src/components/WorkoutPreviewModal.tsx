import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Modal, ScrollView, View, TouchableWithoutFeedback } from 'react-native';

import { ThemedText, ThemedButton, ThemedView, ThemedBadge } from '~/theme';

type WorkoutExercise = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

type Workout = {
  _id: Id<'workouts'>;
  _creationTime: number;
  name: string;
  exercises: WorkoutExercise[];
  createdBy?: Id<'users'>;
};

interface WorkoutPreviewModalProps {
  workout: Workout | null;
  visible: boolean;
  onClose: () => void;
}

export default function WorkoutPreviewModal({
  workout,
  visible,
  onClose,
}: WorkoutPreviewModalProps) {
  // Fetch exercise details for the selected workout
  const exerciseIds = workout?.exercises.map((ex) => ex.exerciseId) || [];
  const exerciseDetails = useQuery(api.exercises.findByIds, { ids: exerciseIds });

  const isPublicWorkout = (workout: Workout) => !workout.createdBy;

  if (!workout) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        {/* Backdrop tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>

        {/* Popover card */}
        <ThemedView className="rounded-2xl bg-white p-4" style={{ maxHeight: 420, width: '90%' }}>
          <ThemedView className="flex-row items-center justify-between border-b border-neutral-200 pb-3">
            <ThemedText className="text-base font-semibold">{workout.name}</ThemedText>
            <ThemedButton variant="secondary" size="sm" onPress={onClose}>
              Close
            </ThemedButton>
          </ThemedView>

          <ScrollView className="pt-3" style={{ maxHeight: 340 }}>
            <ThemedView className="mb-4">
              <ThemedText className="mb-2 text-sm font-medium text-neutral-600">
                Workout Details
              </ThemedText>
              <ThemedView className="rounded-lg bg-white p-4">
                <ThemedText className="text-neutral-700">
                  {workout.exercises.length} exercises
                </ThemedText>
                <ThemedText className="text-neutral-700">
                  Total sets:{' '}
                  {workout.exercises.reduce((sum: number, ex: WorkoutExercise) => sum + ex.sets, 0)}
                </ThemedText>
                <ThemedView className="mt-2">
                  {isPublicWorkout(workout) ? (
                    <ThemedBadge>Public Workout</ThemedBadge>
                  ) : (
                    <ThemedBadge variant="neutral">Private Workout</ThemedBadge>
                  )}
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView>
              <ThemedText className="mb-3 text-sm font-medium text-neutral-600">
                Exercises ({workout.exercises.length})
              </ThemedText>
              {workout.exercises.slice(0, 5).map((workoutExercise, index) => {
                const exercise = exerciseDetails?.find(
                  (ex) => ex?._id === workoutExercise.exerciseId
                );
                return (
                  <ThemedView key={workoutExercise.exerciseId} className="mb-3">
                    <ThemedView className="rounded-lg border border-neutral-200 bg-white p-3">
                      <ThemedView className="flex-row items-center justify-between">
                        <ThemedView className="flex-1">
                          <ThemedText className="font-medium">
                            {index + 1}. {exercise?.name || 'Loading...'}
                          </ThemedText>
                          <ThemedText className="text-sm text-neutral-600">
                            {workoutExercise.sets} sets
                          </ThemedText>
                          {exercise && (
                            <ThemedView className="mt-1 flex-row flex-wrap gap-1">
                              {exercise.categories?.slice(0, 2).map((category: string) => (
                                <ThemedView
                                  key={category}
                                  className="rounded-full bg-neutral-100 px-2 py-1">
                                  <ThemedText className="text-xs text-neutral-700">
                                    {category}
                                  </ThemedText>
                                </ThemedView>
                              ))}
                            </ThemedView>
                          )}
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                );
              })}
              {workout.exercises.length > 5 && (
                <ThemedView className="rounded-lg border border-neutral-200 bg-white p-3">
                  <ThemedText className="text-center text-sm text-neutral-600">
                    ... and {workout.exercises.length - 5} more exercises
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}
