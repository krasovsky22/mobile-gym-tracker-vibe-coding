import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, TouchableOpacity, ScrollView } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { api } from '../../convex/_generated/api';
import { useAlert } from '../context/alert';

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
  const [name, setName] = useState(initialData?.name ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [muscleGroup, setMuscleGroup] = useState(initialData?.muscleGroup ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createExercise = useMutation(api.exercises.create);
  const updateExercise = useMutation(api.exercises.update);

  const handleSubmit = async () => {
    if (!name || !category || !muscleGroup) {
      return error('Please fill in all fields');
    }

    setIsSubmitting(true);

    try {
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
    <ThemedView className="flex-1">
      <ThemedView className="flex-row items-center border-b border-gray-200 p-4">
        <TouchableOpacity
          className="mr-4 rounded-lg bg-gray-100 px-4 py-2"
          onPress={() => router.back()}>
          <ThemedText className="font-semibold text-gray-700">Back</ThemedText>
        </TouchableOpacity>
        <ThemedText className="text-xl font-semibold">
          {mode === 'add' ? 'Add Exercise' : 'Edit Exercise'}
        </ThemedText>
      </ThemedView>

      <ScrollView className="flex-1 p-4">
        <ThemedView className="mb-4">
          <ThemedText className="mb-2 text-lg font-semibold">Exercise Name</ThemedText>
          <TextInput
            className="rounded-lg border border-gray-300 p-3"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Bench Press"
          />
        </ThemedView>

        <ThemedView className="mb-4">
          <ThemedText className="mb-2 text-lg font-semibold">Category</ThemedText>
          <TextInput
            className="rounded-lg border border-gray-300 p-3"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Strength"
          />
        </ThemedView>

        <ThemedView className="mb-4">
          <ThemedText className="mb-2 text-lg font-semibold">Muscle Group</ThemedText>
          <TextInput
            className="rounded-lg border border-gray-300 p-3"
            value={muscleGroup}
            onChangeText={setMuscleGroup}
            placeholder="e.g., Chest"
          />
        </ThemedView>

        <TouchableOpacity
          className={`mt-6 rounded-lg p-4 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <ThemedText className="text-center font-semibold text-white">
            {isSubmitting
              ? `${mode === 'add' ? 'Creating' : 'Updating'}...`
              : `${mode === 'add' ? 'Create' : 'Update'} Exercise`}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}
