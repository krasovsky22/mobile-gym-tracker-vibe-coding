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
  const moveToNextExercise = useMutation(api.trackedWorkoutExercises.moveToNextExercise);

  // Query for tracked workout and all related data
  const trackedWorkoutData = useQuery(api.trackedWorkouts.get, {
    id: id as Id<'trackedWorkouts'>,
  });

  const handleContinueExercise = async (exerciseId: Id<'trackedWorkoutExercises'>) => {
    router.push({
      pathname: '/track-workout/[id]/exercise/[exerciseId]',
      params: {
        id,
        exerciseId,
      },
    });
  };

  const handleStartExercise = async (exerciseId: Id<'exercises'>) => {
    if (!trackedWorkoutData) return;

    try {
      const trackedExerciseId = await moveToNextExercise({
        trackedWorkoutId: id as Id<'trackedWorkouts'>,
        selectedExerciseId: exerciseId as Id<'exercises'>,
      });

      console.log('Tracked exercise created:', trackedExerciseId);

      // Navigate to exercise tracking screen
      router.push({
        pathname: '/track-workout/[id]/exercise/[exerciseId]',
        params: {
          id,
          exerciseId: trackedExerciseId,
        },
      });
    } catch (err) {
      console.error('Error starting exercise:', err);
      error('Failed to start exercise');
    }
  };

  if (!trackedWorkoutData) {
    return (
      <ThemedView className="items-center justify-center flex-1">
        <ThemedText>Loading workout...</ThemedText>
      </ThemedView>
    );
  }

  return (
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
              {trackedWorkoutData.workout.name}
            </ThemedText>
          </ThemedView>

          <ScrollView className="flex-1">
            <ThemedView className="p-4">
              {trackedWorkoutData.workout.exercises.map((workoutExercise) => {
                const trackedExercise = trackedWorkoutData.trackedExercises?.find(
                  (te) => te.exerciseId === workoutExercise.exerciseId
                );

                const isStarted = !!trackedExercise;

                const exercise = workoutExercise.exercise;
                if (!exercise) return null;

                return (
                  <ThemedView
                    key={exercise._id}
                    className="p-4 mb-4 border rounded-lg border-neutral-200">
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
                        onPress={() =>
                          isStarted
                            ? handleContinueExercise(trackedExercise._id)
                            : handleStartExercise(exercise._id)
                        }>
                        {isStarted ? 'In Progress' : 'Start'}
                      </ThemedButton>
                    </ThemedView>
                    {isStarted && (
                      <ThemedView className="mt-2">
                        {trackedWorkoutData.trackedExercises
                          ?.find((te) => te.exerciseId === exercise._id)
                          ?.sets.map((set, index) => (
                            <ThemedView key={index} className="flex-row items-center mt-1">
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

          <ThemedView className="p-4 border-t border-neutral-200">
            <ThemedText className="mb-2 text-sm text-center text-neutral-600">
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
