import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';

import { api } from '../../../../../convex/_generated/api';

export default function ExercisesScreen() {
  const router = useRouter();
  const exercises = useQuery(api.exercises.list);
  const deleteExercise = useMutation(api.exercises.remove);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (exerciseId: string) => {
    Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteExercise({ id: exerciseId });
          } catch (error) {
            console.error('Error deleting exercise:', error);
            Alert.alert('Error', 'Failed to delete exercise');
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
    <View className="mt-3 flex-1 bg-white">
      <View className="p-4">
        <TouchableOpacity
          className="rounded-lg bg-blue-500 p-4"
          onPress={() => router.push('/settings/exercises/add')}>
          <Text className="text-center font-semibold text-white">Add New Exercise</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {exercises?.map((exercise) => (
          <View key={exercise._id} className="mb-4 rounded-lg border border-gray-200 p-4">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold">{exercise.name}</Text>
                <Text className="text-gray-600">Category: {exercise.category}</Text>
                <Text className="text-gray-600">Muscle Group: {exercise.muscleGroup}</Text>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className="rounded-lg bg-gray-200 px-3 py-2"
                  onPress={() => handleEdit(exercise._id)}>
                  <Text className="font-semibold text-gray-700">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-lg bg-red-100 px-3 py-2"
                  onPress={() => handleDelete(exercise._id)}
                  disabled={isDeleting}>
                  <Text className="font-semibold text-red-700">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
