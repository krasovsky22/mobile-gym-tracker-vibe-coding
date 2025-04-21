import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { api } from '../../../../../../convex/_generated/api';

export default function EditExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exercise = useQuery(api.exercises.get, { id });
  const updateExercise = useMutation(api.exercises.update);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setCategory(exercise.category);
      setMuscleGroup(exercise.muscleGroup);
    }
  }, [exercise]);

  const handleSubmit = async () => {
    if (!name || !category || !muscleGroup) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateExercise({
        id,
        name,
        category,
        muscleGroup,
      });
      router.back();
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'Failed to update exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

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
        disabled={isSubmitting}
      >
        <Text className="text-center font-semibold text-white">
          {isSubmitting ? 'Updating...' : 'Update Exercise'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
} 
