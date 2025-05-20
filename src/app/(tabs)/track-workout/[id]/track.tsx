import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedTextInput, ThemedView } from '~/theme';

type ExerciseSetType = {
  weight: number | null;
  reps: number | null;
  isCompleted: boolean;
};

type ExerciseType = {
  _id: Id<'exercises'>;
  name: string;
  category: string;
  muscleGroup: string;
};

type TrackingExerciseType = {
  exercise: ExerciseType;
  exerciseId: Id<'exercises'>;
  sets: ExerciseSetType[];
};

export default function TrackWorkoutDetailsScreen() {
  const router = useRouter();
  const { error } = useAlert();
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('trackedWorkoutId', id);
  const trackedWorkout = useQuery(api.trackedWorkouts.get, { id: id as Id<'trackedWorkouts'> })!;

  console.log('trackedWorkout', trackedWorkout);
  const workout = useQuery(api.workouts.get, { id: trackedWorkout.workoutId })!;
  const exercises = useQuery(api.exercises.findByIds, {
    ids: workout.exercises.map((exercise) => exercise.exerciseId),
  })!;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [trackingExercises, setTrackingExercises] = useState<TrackingExerciseType[]>([]);

  useEffect(() => {
    if (workout) {
      setTrackingExercises(
        workout.exercises.map((ex) => {
          const exercise = exercises.find((exercise) => exercise._id === ex.exerciseId)!;
          return {
            ...ex,
            exercise,
            sets: Array(ex.sets).fill({ weight: null, reps: null, isCompleted: false }),
          };
        })
      );
    }
  }, [workout._id]);

  const saveWorkoutData = useCallback();
  // async (options: {
  //   exercises: TrackingExercise[];
  //   showError?: boolean;
  //   finishWorkout?: boolean;
  // }) => {
  //   if (!workout) return;

  //   try {
  //     await saveTrackedWorkout({
  //       workoutId: workout._id,
  //       exercises: options.exercises
  //         .filter((exercise) => exercise.sets.some((set) => set.reps !== null))
  //         .map((exercise) => ({
  //           exerciseId: exercise.exerciseId,
  //           sets: exercise.sets
  //             .filter((set) => set.reps !== null)
  //             .map((set) => ({
  //               weight: set.weight ?? 0,
  //               reps: set.reps!,
  //               isCompleted: set.isCompleted,
  //             })),
  //         })),
  //     });

  //     if (options.finishWorkout) {
  //       router.replace('/home');
  //     }
  //   } catch (err) {
  //     console.error('Error saving workout:', err);
  //     if (options.showError) {
  //       error('Failed to save workout progress');
  //     }
  //   }
  // },
  // [workout, saveTrackedWorkout, router, error]

  const handleAutoSave = useCallback(
    async (updatedExercises: TrackingExercise[]) => {
      if (!workout || autoSaving) return;

      try {
        setAutoSaving(true);
        await saveWorkoutData({
          exercises: updatedExercises,
          showError: false,
        });
      } finally {
        setAutoSaving(false);
      }
    },
    [workout, autoSaving, saveWorkoutData]
  );

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: number | boolean | null
  ) => {
    setTrackingExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: [...updated[exerciseIndex].sets],
      };
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        [field]: value,
      };
      return updated;
    });

    // Schedule auto-save
    // setTimeout(() => {
    //   handleAutoSave(trackingExercises);
    // }, 1000);
  };

  const handleSaveWorkout = async () => {
    if (!workout) return;

    try {
      setIsSubmitting(true);
      await saveWorkoutData({
        exercises: trackingExercises,
        showError: true,
        finishWorkout: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!trackedWorkout || !workout || !exercises) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Loading...</ThemedText>
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
            <ThemedText className="text-xl font-semibold">Track Workout {workout.name}</ThemedText>
          </ThemedView>
          <ScrollView className="flex-1">
            <ThemedView className="p-4">
              {trackingExercises.map((trackingExercise, exerciseIndex) => {
                const exercise = trackingExercise.exercise;
                if (!exercise) return null;

                return (
                  <ThemedView
                    key={exercise._id}
                    className="mb-6 rounded-lg border border-gray-200 p-4">
                    {/* Exercise Header */}
                    <ThemedView className="flex-row items-center justify-between">
                      {/* Exercise Name */}
                      <ThemedView className="flex-1">
                        <ThemedText className="mb-2 text-lg font-semibold">
                          {exercise.name}
                        </ThemedText>
                        <ThemedText className="mb-4 text-gray-600">
                          {exercise.muscleGroup}
                        </ThemedText>
                      </ThemedView>

                      {/* Start Exercise Button */}
                      <ThemedView>
                        <ThemedButton>Start Exercise</ThemedButton>
                      </ThemedView>
                    </ThemedView>

                    {trackingExercise.sets.map((set, setIndex) => (
                      <ThemedView
                        className="mb-4 flex-row items-center justify-between border-b border-gray-100 pb-4"
                        key={`${exercise._id}-${setIndex}`}>
                        <ThemedText className="mt-5 w-20">Set {setIndex + 1}</ThemedText>
                        <ThemedView className="flex-1 flex-row items-center justify-between">
                          <ThemedView className="flex-row items-center gap-2 space-x-4">
                            <ThemedView className="gap-1">
                              <ThemedText className="text-center text-xs text-gray-600">
                                Weight (kg)
                              </ThemedText>
                              <ThemedTextInput
                                className="w-20 rounded-lg border border-gray-300 p-2 text-center"
                                value={set.weight?.toString() ?? ''}
                                onChangeText={(value) =>
                                  handleUpdateSet(
                                    exerciseIndex,
                                    setIndex,
                                    'weight',
                                    value ? parseFloat(value) : null
                                  )
                                }
                                keyboardType="numeric"
                                placeholder="0"
                              />
                            </ThemedView>

                            <ThemedView className="items-center justify-center p-1">
                              <ThemedText className="mb-1 text-center text-xs text-gray-600">
                                Reps
                              </ThemedText>
                              <ThemedTextInput
                                className="w-20 rounded-lg border border-gray-300 p-2 text-center"
                                value={set.reps?.toString() ?? ''}
                                onChangeText={(value) =>
                                  handleUpdateSet(
                                    exerciseIndex,
                                    setIndex,
                                    'reps',
                                    value ? parseInt(value, 10) : null
                                  )
                                }
                                keyboardType="numeric"
                                placeholder="0"
                              />
                            </ThemedView>
                          </ThemedView>
                        </ThemedView>
                        <ThemedButton
                          className="mt-5"
                          variant={set.isCompleted ? 'primary' : 'secondary'}
                          onPress={() =>
                            handleUpdateSet(
                              exerciseIndex,
                              setIndex,
                              'isCompleted',
                              !set.isCompleted
                            )
                          }>
                          {set.isCompleted ? 'Done' : 'Mark Done'}
                        </ThemedButton>
                      </ThemedView>
                    ))}
                  </ThemedView>
                );
              })}
            </ThemedView>
          </ScrollView>

          <ThemedView className="border-t border-gray-200 bg-white p-4">
            <ThemedButton variant="primary" disabled={isSubmitting} onPress={handleSaveWorkout}>
              {autoSaving ? 'Auto-saving...' : isSubmitting ? 'Saving...' : 'Save & Finish'}
            </ThemedButton>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
