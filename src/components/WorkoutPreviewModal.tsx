import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Modal, ScrollView, View, TouchableWithoutFeedback } from 'react-native';

import { ThemedText, ThemedButton, ThemedView } from '~/theme';

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
        className="items-center justify-center flex-1 px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        {/* Backdrop tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>

        {/* Popover card */}
        <ThemedView className="p-4 bg-white rounded-2xl" style={{ maxHeight: 420, width: '90%' }}>
          <ThemedView className="flex-row items-center justify-between pb-3 border-b border-neutral-200">
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
              <ThemedView className="p-4 bg-white rounded-lg">
                <ThemedText className="text-neutral-700">
                  {workout.exercises.length} exercises
                </ThemedText>
                <ThemedText className="text-neutral-700">
                  Total sets:{' '}
                  {workout.exercises.reduce((sum: number, ex: WorkoutExercise) => sum + ex.sets, 0)}
                </ThemedText>
                {isPublicWorkout(workout) && (
                  <ThemedView className="mt-2">
                    <ThemedView className="px-3 py-1 bg-blue-100 rounded-full w-fit">
                      <ThemedText className="text-xs font-medium text-blue-800">
                        Public Workout
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                )}
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
                    <ThemedView className="p-3 bg-white border rounded-lg border-neutral-200">
                      <ThemedView className="flex-row items-center justify-between">
                        <ThemedView className="flex-1">
                          <ThemedText className="font-medium">
                            {index + 1}. {exercise?.name || 'Loading...'}
                          </ThemedText>
                          <ThemedText className="text-sm text-neutral-600">
                            {workoutExercise.sets} sets
                          </ThemedText>
                          {exercise && (
                            <ThemedView className="flex-row flex-wrap gap-1 mt-1">
                              {exercise.categories?.slice(0, 2).map((category: string) => (
                                <ThemedView
                                  key={category}
                                  className="px-2 py-1 rounded-full bg-neutral-100">
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
                <ThemedView className="p-3 bg-white border rounded-lg border-neutral-200">
                  <ThemedText className="text-sm text-center text-neutral-600">
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
