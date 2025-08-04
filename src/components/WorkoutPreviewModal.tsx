import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Modal, SafeAreaView, ScrollView } from 'react-native';

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}>
      <SafeAreaView className="bg-neutral-50" style={{ maxHeight: '60%' }}>
        <ThemedView className="max-h-96" style={{ maxHeight: 400 }}>
          <ThemedView className="flex-row items-center justify-between border-b border-neutral-200 bg-white p-4">
            <ThemedText className="text-lg font-semibold">{workout.name}</ThemedText>
            <ThemedButton variant="secondary" size="sm" onPress={onClose}>
              Close
            </ThemedButton>
          </ThemedView>

          <ScrollView className="p-4" style={{ maxHeight: 300 }}>
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
                {isPublicWorkout(workout) && (
                  <ThemedView className="mt-2">
                    <ThemedView className="w-fit rounded-full bg-blue-100 px-3 py-1">
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
      </SafeAreaView>
    </Modal>
  );
}
