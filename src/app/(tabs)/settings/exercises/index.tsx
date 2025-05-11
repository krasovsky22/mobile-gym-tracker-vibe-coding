import { api } from 'convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { TextInput, TouchableOpacity, ScrollView } from 'react-native';

import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';
import { useAlert } from '~/context/alert';

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
      <ThemedView className="p-4">
        <TextInput
          className="rounded-lg border border-gray-200 p-3"
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>

      <ScrollView className="flex-1 px-4">
        {filteredExercises.map((exercise) => (
          <ThemedView key={exercise._id} className="mb-4 rounded-lg border border-gray-200 p-4">
            <ThemedView className="flex-row justify-between">
              <ThemedView className="flex-1">
                <ThemedText className="text-lg font-semibold">{exercise.name}</ThemedText>
                <ThemedText className="text-neutral-500">Category: {exercise.category}</ThemedText>
                <ThemedText className="text-neutral-500">
                  Muscle Group: {exercise.muscleGroup}
                </ThemedText>
              </ThemedView>
              <ThemedView className="flex-row items-center gap-2 space-x-2">
                <TouchableOpacity
                  className="rounded-lg bg-gray-200 px-3 py-2"
                  onPress={() => handleEdit(exercise._id)}>
                  <ThemedText className="font-semibold text-gray-700">Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-lg bg-red-100 px-3 py-2"
                  onPress={() => handleDelete(exercise._id)}
                  disabled={isDeleting}>
                  <ThemedText className="font-semibold text-red-700">Delete</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>

      <ThemedView className="bg-white p-4">
        <TouchableOpacity
          className="rounded-lg bg-blue-500 p-4"
          onPress={() => router.push('/settings/exercises/add')}>
          <ThemedText className="text-center font-semibold text-white">Add New Exercise</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
