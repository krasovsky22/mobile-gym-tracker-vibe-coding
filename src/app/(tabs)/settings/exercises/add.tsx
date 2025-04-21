import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

import { api } from '../../../../../convex/_generated/api';

export default function AddExerciseScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const createExercise = useMutation(api.exercises.create);

  const handleSubmit = async () => {
    if (!name || !category || !muscleGroup) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createExercise({
        name,
        category,
        muscleGroup,
      });
      router.back();
    } catch (error) {
      console.error('Error creating exercise:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold">Exercise Name</Text>
        <TextInput
          className="rounded-lg border border-gray-300 p-3"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Bench Press"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold">Category</Text>
        <TextInput
          className="rounded-lg border border-gray-300 p-3"
          value={category}
          onChangeText={setCategory}
          placeholder="e.g., Strength"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold">Muscle Group</Text>
        <TextInput
          className="rounded-lg border border-gray-300 p-3"
          value={muscleGroup}
          onChangeText={setMuscleGroup}
          placeholder="e.g., Chest"
        />
      </View>

      <TouchableOpacity
        className={`mt-6 rounded-lg p-4 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}
        onPress={handleSubmit}
        disabled={isSubmitting}>
        <Text className="text-center font-semibold text-white">
          {isSubmitting ? 'Creating...' : 'Create Exercise'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
