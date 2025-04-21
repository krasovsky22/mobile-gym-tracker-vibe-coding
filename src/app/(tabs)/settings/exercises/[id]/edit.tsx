import { api } from 'convex/_generated/api';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

import ExerciseForm from '~/components/ExerciseForm';

export default function EditExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = useQuery(api.exercises.get, { id });

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ExerciseForm
      mode="edit"
      exerciseId={id}
      initialData={{
        name: exercise.name,
        category: exercise.category,
        muscleGroup: exercise.muscleGroup,
      }}
    />
  );
}
