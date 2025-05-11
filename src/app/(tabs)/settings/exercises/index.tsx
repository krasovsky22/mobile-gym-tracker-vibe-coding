import { api } from 'convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';

import { useAlert } from '~/context/alert';
import { ThemedText, ThemedTextInput, ThemedView, ThemedButton } from '~/theme';

export default function ExercisesScreen() {
  const router = useRouter();
  const { error, alert } = useAlert();
  const exercises = useQuery(api.exercises.list);
  const deleteExercise = useMutation(api.exercises.remove);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredExercises = useMemo(
    () =>
      exercises?.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ?? [],
    [exercises, searchQuery]
  );

  const handleDelete = (exerciseId: string) => {
    setIsDeleting(true);
    alert('Are you sure you want to delete this exercise?', 'Confirm Delete', [
      { text: 'Cancel', style: 'cancel', onPress: () => setIsDeleting(false) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExercise({ id: exerciseId });
          } catch (err) {
            console.error('Error deleting exercise:', err);
            error('Failed to delete exercise');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleEdit = (exerciseId: string) => {
    router.push(`/settings/exercises/${exerciseId}/edit`);
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <ThemedView className="p-4">
          <ThemedTextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
          />
        </ThemedView>

        <ScrollView className="flex-1 px-4">
          {filteredExercises.map((exercise) => (
            <ThemedView key={exercise._id} className="mb-4 rounded-lg border border-gray-200 p-4">
              <ThemedView className="flex-row justify-between">
                <ThemedView className="flex-1">
                  <ThemedText className="text-lg font-semibold">{exercise.name}</ThemedText>
                  <ThemedText className="text-neutral-500">
                    Category: {exercise.category}
                  </ThemedText>
                  <ThemedText className="text-neutral-500">
                    Muscle Group: {exercise.muscleGroup}
                  </ThemedText>
                </ThemedView>
                <ThemedView className="flex-row items-center gap-2 space-x-2">
                  <ThemedButton
                    variant="secondary"
                    size="sm"
                    onPress={() => handleEdit(exercise._id)}>
                    Edit
                  </ThemedButton>
                  <ThemedButton
                    variant="danger"
                    size="sm"
                    onPress={() => handleDelete(exercise._id)}
                    disabled={isDeleting}>
                    Delete
                  </ThemedButton>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}
        </ScrollView>

        <ThemedView className="bg-white p-4 dark:bg-neutral-800">
          <ThemedButton
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/settings/exercises/add')}>
            Add New Exercise
          </ThemedButton>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}
