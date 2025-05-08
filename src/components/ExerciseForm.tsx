import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

import { useAlert } from './AlertProvider';
import { api } from '../../convex/_generated/api';

type ExerciseFormProps = {
  mode: 'add' | 'edit';
  exerciseId?: string;
  initialData?: {
    name: string;
    category: string;
    muscleGroup: string;
  };
};

export default function ExerciseForm({ mode, exerciseId, initialData }: ExerciseFormProps) {
  const router = useRouter();
  const { error } = useAlert();
  const createExercise = useMutation(api.exercises.create);
  const updateExercise = useMutation(api.exercises.update);

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [muscleGroup, setMuscleGroup] = useState(initialData?.muscleGroup || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setMuscleGroup(initialData.muscleGroup);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name || !category || !muscleGroup) {
      error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === 'add') {
        await createExercise({
          name,
          category,
          muscleGroup,
        });
      } else if (mode === 'edit' && exerciseId) {
        await updateExercise({
          id: exerciseId,
          name,
          category,
          muscleGroup,
        });
      }
      router.back();
    } catch (err) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} exercise:`, err);
      error(`Failed to ${mode === 'add' ? 'create' : 'update'} exercise`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center border-b border-gray-200 p-4">
        <TouchableOpacity
          className="mr-4 rounded-lg bg-gray-100 px-4 py-2"
          onPress={() => router.back()}>
          <Text className="font-semibold text-gray-700">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold">
          {mode === 'add' ? 'Add Exercise' : 'Edit Exercise'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
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
            {isSubmitting
              ? `${mode === 'add' ? 'Creating' : 'Updating'}...`
              : `${mode === 'add' ? 'Create' : 'Update'} Exercise`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
