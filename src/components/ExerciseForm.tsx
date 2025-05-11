import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';

import { api } from '../../convex/_generated/api';

import { ThemedButton } from '~/components/ThemedButton';
import { ThemedText } from '~/components/ThemedText';
import { ThemedTextInput } from '~/components/ThemedTextInput';
import { ThemedView } from '~/components/ThemedView';
import { useAlert } from '~/context/alert';

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
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-row items-center border-b border-gray-200 p-4">
          <ThemedButton
            variant="secondary"
            size="md"
            className="mr-4"
            onPress={() => router.back()}>
            Back
          </ThemedButton>
          <ThemedText className="text-xl font-semibold">
            {mode === 'add' ? 'Add Exercise' : 'Edit Exercise'}
          </ThemedText>
        </ThemedView>

        <ScrollView className="flex-1 p-4">
          <ThemedView className="mb-4">
            <ThemedText className="mb-2 text-lg font-semibold">Exercise Name</ThemedText>
            <ThemedTextInput value={name} onChangeText={setName} placeholder="e.g., Bench Press" />
          </ThemedView>

          <ThemedView className="mb-4">
            <ThemedText className="mb-2 text-lg font-semibold">Category</ThemedText>
            <ThemedTextInput
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Strength"
            />
          </ThemedView>

          <ThemedView className="mb-4">
            <ThemedText className="mb-2 text-lg font-semibold">Muscle Group</ThemedText>
            <ThemedTextInput
              value={muscleGroup}
              onChangeText={setMuscleGroup}
              placeholder="e.g., Chest"
            />
          </ThemedView>

          <ThemedButton
            variant="primary"
            size="lg"
            fullWidth
            className="mt-6"
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting
              ? `${mode === 'add' ? 'Creating' : 'Updating'}...`
              : `${mode === 'add' ? 'Create' : 'Update'} Exercise`}
          </ThemedButton>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
