import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedView } from '~/theme';

type WorkoutExercise = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

export default function TrackWorkoutDetailsScreen() {
  const router = useRouter();
  const { error } = useAlert();
  const { id } = useLocalSearchParams<{ id: string }>();
  const createTrackedExercise = useMutation(api.trackedWorkoutExercises.create);

  // Query for tracked workout and all related data
  const trackedWorkoutData = useQuery(api.trackedWorkouts.get, {
    id: id as Id<'trackedWorkouts'>,
  });

  console.log('Tracked workout data:', trackedWorkoutData);

  const handleStartExercise = async (exerciseId: Id<'exercises'>) => {
    if (!trackedWorkoutData) return;

    try {
      // Find the exercise configuration to get number of sets
      const exerciseConfig = trackedWorkoutData.workout.exercises.find(
        (ex) => ex.exerciseId === exerciseId
      );

      if (!exerciseConfig) {
        throw new Error('Exercise configuration not found');
      }

      // Create empty sets based on the workout configuration
      const emptySets = Array(exerciseConfig.sets)
        .fill(null)
        .map(() => ({
          weight: 0,
          reps: 0,
          isCompleted: false,
        }));

      const trackedExercise = await createTrackedExercise({
        trackedWorkoutId: trackedWorkoutData._id,
        exerciseId,
        sets: emptySets,
      });

      // Navigate to exercise tracking screen
      router.push({
        pathname: '/track-workout/[id]/exercise/[exerciseId]',
        params: {
          id,
          exerciseId: trackedExercise,
        },
      });
    } catch (err) {
      console.error('Error starting exercise:', err);
      error('Failed to start exercise');
    }
  };

  if (!trackedWorkoutData) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Loading workout...</ThemedText>
      </ThemedView>
    );
  }

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
              {trackedWorkoutData.workout.name}
            </ThemedText>
          </ThemedView>

          <ScrollView className="flex-1">
            <ThemedView className="p-4">
              {trackedWorkoutData.workout.exercises.map((workoutExercise) => {
                const isStarted = trackedWorkoutData.trackedExercises?.some(
                  (te) => te.exerciseId === workoutExercise.exerciseId
                );

                const exercise = workoutExercise.exercise;
                if (!exercise) return null;

                return (
                  <ThemedView
                    key={exercise._id}
                    className="mb-4 rounded-lg border border-neutral-200 p-4">
                    <ThemedView className="flex-row items-center justify-between">
                      <ThemedView className="flex-1">
                        <ThemedText className="text-lg font-semibold">{exercise.name}</ThemedText>
                        <ThemedText className="text-neutral-600">{exercise.muscleGroup}</ThemedText>
                        <ThemedText className="text-neutral-600">
                          Sets: {workoutExercise.sets}
                        </ThemedText>
                      </ThemedView>
                      <ThemedButton
                        variant={isStarted ? 'secondary' : 'primary'}
                        onPress={() => handleStartExercise(exercise._id)}>
                        {isStarted ? 'In Progress' : 'Start'}
                      </ThemedButton>
                    </ThemedView>
                    {isStarted && (
                      <ThemedView className="mt-2">
                        {trackedWorkoutData.trackedExercises
                          ?.find((te) => te.exerciseId === exercise._id)
                          ?.sets.map((set, index) => (
                            <ThemedView key={index} className="mt-1 flex-row items-center">
                              <ThemedText className="text-sm text-neutral-600">
                                Set {set.setNumber}: {set.weight}kg × {set.reps} reps
                              </ThemedText>
                              {set.isCompleted && (
                                <ThemedText className="ml-2 text-sm text-success-600">✓</ThemedText>
                              )}
                            </ThemedView>
                          ))}
                      </ThemedView>
                    )}
                  </ThemedView>
                );
              })}
            </ThemedView>
          </ScrollView>

          <ThemedView className="border-t border-neutral-200 p-4">
            <ThemedText className="mb-2 text-center text-sm text-neutral-600">
              Track all exercises to complete the workout
            </ThemedText>
            <ThemedButton
              variant="primary"
              size="lg"
              className="w-full"
              disabled={
                !trackedWorkoutData.trackedExercises?.every((te) => te.status === 'completed')
              }
              onPress={() => {
                // TODO: Implement workout completion
              }}>
              Complete Workout
            </ThemedButton>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
