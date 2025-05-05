import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

import WorkoutForm from '~/components/WorkoutForm';

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: Id<'workouts'> }>();
  const workout = useQuery(api.workouts.get, { id });

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <WorkoutForm
      mode="edit"
      workoutId={id}
      initialData={{
        name: workout.name,
        exercises: workout.exercises,
      }}
    />
  );
}
