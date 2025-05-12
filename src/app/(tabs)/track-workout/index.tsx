import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

import { ThemedButton, ThemedText, ThemedView } from '~/theme';

type WorkoutExercise = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

type Workout = {
  _id: Id<'workouts'>;
  name: string;
  exercises: WorkoutExercise[];
};

export default function TrackWorkoutScreen() {
  const router = useRouter();
  const workouts = useQuery(api.workouts.list);

  const handleSelectWorkout = (workout: Workout) => {
    router.push({
      pathname: '/track-workout/[id]/track',
      params: { id: workout._id },
    });
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-6">
          <ThemedText className="mb-6 text-center text-3xl font-bold text-neutral-900">
            Select Workout
          </ThemedText>

          {workouts?.map((workout: Workout) => (
            <TouchableOpacity
              key={workout._id}
              onPress={() => handleSelectWorkout(workout)}
              className="mb-4">
              <ThemedView className="rounded-lg border border-gray-200 p-4">
                <ThemedText className="text-lg font-semibold">{workout.name}</ThemedText>
                <ThemedText className="text-gray-600">
                  {workout.exercises.length} exercises
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}

          {workouts?.length === 0 && (
            <ThemedView className="items-center">
              <ThemedText className="mb-4 text-center text-neutral-600">
                No workouts available
              </ThemedText>
              <ThemedButton variant="primary" onPress={() => router.push('/settings/workouts/add')}>
                Create Workout
              </ThemedButton>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
