import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedTextInput, ThemedView } from '~/theme';

type ExerciseSet = {
  weight: number;
  reps: number;
  isCompleted: boolean;
};

type TrackingExercise = {
  exerciseId: Id<'exercises'>;
  sets: ExerciseSet[];
};

export default function TrackWorkoutDetailsScreen() {
  const router = useRouter();
  const { error } = useAlert();
  const { id } = useLocalSearchParams<{ id: Id<'workouts'> }>();
  const workout = useQuery(api.workouts.get, { id });
  const exercises = useQuery(api.exercises.list);
  const saveTrackedWorkout = useMutation(api.trackedWorkouts.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingExercises, setTrackingExercises] = useState<TrackingExercise[]>([]);

  // Initialize tracking exercises when workout data is loaded
  useEffect(() => {
    if (workout && !trackingExercises.length) {
      setTrackingExercises(
        workout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: Array(ex.sets).fill({ weight: 0, reps: 0, isCompleted: false }),
        }))
      );
    }
  }, [workout]);

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: number | boolean
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
  };

  const handleSaveWorkout = async () => {
    if (!workout) return;

    try {
      setIsSubmitting(true);
      await saveTrackedWorkout({
        workoutId: workout._id,
        exercises: trackingExercises,
      });
      router.replace('/home');
    } catch (err) {
      console.error('Error saving tracked workout:', err);
      error('Failed to save workout progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!workout || !exercises) {
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
                const exercise = exercises.find((e) => e._id === trackingExercise.exerciseId);
                if (!exercise) return null;

                return (
                  <ThemedView
                    key={exercise._id}
                    className="mb-6 rounded-lg border border-gray-200 p-4">
                    <ThemedText className="mb-2 text-lg font-semibold">{exercise.name}</ThemedText>
                    <ThemedText className="mb-4 text-gray-600">{exercise.muscleGroup}</ThemedText>

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
                                value={set.weight.toString()}
                                onChangeText={(value) =>
                                  handleUpdateSet(
                                    exerciseIndex,
                                    setIndex,
                                    'weight',
                                    parseFloat(value) || 0
                                  )
                                }
                                keyboardType="numeric"
                              />
                            </ThemedView>

                            <ThemedView className="items-center justify-center p-1">
                              <ThemedText className="mb-1 text-center text-xs text-gray-600">
                                Reps
                              </ThemedText>
                              <ThemedTextInput
                                className="w-20 rounded-lg border border-gray-300 p-2 text-center"
                                value={set.reps.toString()}
                                onChangeText={(value) =>
                                  handleUpdateSet(exerciseIndex, setIndex, 'reps', +(value || 0))
                                }
                                keyboardType="numeric"
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
              {isSubmitting ? 'Saving...' : 'Save Workout'}
            </ThemedButton>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
