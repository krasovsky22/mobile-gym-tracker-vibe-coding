import { Ionicons } from '@expo/vector-icons';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedView } from '~/theme';

export default function TrackWorkoutDetailsScreen() {
  const router = useRouter();
  const { error, success } = useAlert();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isCompleting, setIsCompleting] = useState(false);
  const moveToNextExercise = useMutation(api.trackedWorkoutExercises.moveToNextExercise);
  const completeWorkout = useMutation(api.trackedWorkouts.complete);

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

  const handleCompleteWorkout = async () => {
    if (!trackedWorkoutData || !id) return;

    setIsCompleting(true);
    try {
      await completeWorkout({ id: id as Id<'trackedWorkouts'> });

      // Show success message
      success('Workout completed successfully! Great job!');

      // Navigate back to the main workout tracking screen
      router.push('/track-workout');
    } catch (err) {
      console.error('Error completing workout:', err);
      error('Failed to complete workout. Make sure all exercises are finished.');
    } finally {
      setIsCompleting(false);
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
              {trackedWorkoutData.workout.exercises.map((workoutExercise, index) => {
                const trackedExercise = trackedWorkoutData.trackedExercises?.find(
                  (te) => te.exerciseId === workoutExercise.exerciseId
                );

                const isStarted = !!trackedExercise;
                const isCompleted = isStarted && trackedExercise.status === 'completed';

                const exercise = workoutExercise.exercise;
                if (!exercise) return null;

                return (
                  <ThemedView
                    key={exercise._id}
                    className="flex-row items-center flex-1 w-full p-4 mb-4 border rounded-lg">
                    <ThemedView className="flex-1 ">
                      <ThemedView className="flex-row items-center justify-between flex-1 ">
                        <ThemedView className="flex-1">
                          <ThemedView className="flex-row items-center">
                            <ThemedText className="text-lg font-semibold">
                              {exercise.name}
                            </ThemedText>
                          </ThemedView>
                          <ThemedText className="text-neutral-600">
                            {exercise.muscleGroup}
                          </ThemedText>
                          <ThemedText className="text-neutral-600">
                            Sets: {workoutExercise.sets}
                          </ThemedText>
                        </ThemedView>
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
                                  <ThemedText className="ml-2 text-sm text-success-600">
                                    ✓
                                  </ThemedText>
                                )}
                              </ThemedView>
                            ))}
                        </ThemedView>
                      )}
                    </ThemedView>
                    {isCompleted && (
                      <ThemedView className="items-center justify-center p-2 ml-2 bg-green-500 rounded-full">
                        <Ionicons name="checkmark-circle-outline" size={24} color="white" />
                      </ThemedView>
                    )}
                    {!isCompleted && (
                      <ThemedButton
                        variant={isCompleted ? 'success' : isStarted ? 'secondary' : 'primary'}
                        onPress={() =>
                          isStarted
                            ? handleContinueExercise(trackedExercise._id)
                            : handleStartExercise(exercise._id)
                        }>
                        {isCompleted ? 'Completed' : isStarted ? 'Continue' : 'Start'}
                      </ThemedButton>
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
                isCompleting ||
                !trackedWorkoutData.trackedExercises?.every((te) => te.status === 'completed')
              }
              onPress={handleCompleteWorkout}>
              {isCompleting ? 'Completing Workout...' : 'Complete Workout'}
            </ThemedButton>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
