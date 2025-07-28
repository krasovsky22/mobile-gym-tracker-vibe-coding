import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, SafeAreaView, Alert } from 'react-native';

import { api } from '../../convex/_generated/api';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedTextInput, ThemedView } from '~/theme';

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
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(
    initialData?.muscleGroup ? [initialData.muscleGroup] : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createExercise = useMutation(api.exercises.create);
  const updateExercise = useMutation(api.exercises.update);
  const muscleGroups = useQuery(api.muscleGroups.list);

  const availableMuscleGroups = muscleGroups?.map((mg) => mg.name) || [];

  const handleMuscleGroupToggle = (muscleGroup: string) => {
    setSelectedMuscleGroups((prev) => {
      if (prev.includes(muscleGroup)) {
        return prev.filter((mg) => mg !== muscleGroup);
      } else {
        return [...prev, muscleGroup];
      }
    });
  };

  const showMuscleGroupPicker = () => {
    if (availableMuscleGroups.length === 0) {
      error('Muscle groups are still loading. Please try again in a moment.');
      return;
    }

    Alert.alert('Select Muscle Groups', 'Choose the muscle groups this exercise targets', [
      ...availableMuscleGroups.map((muscleGroup) => ({
        text: `${selectedMuscleGroups.includes(muscleGroup) ? '✓ ' : ''}${muscleGroup}`,
        onPress: () => handleMuscleGroupToggle(muscleGroup),
      })),
      {
        text: 'Done',
        style: 'cancel',
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!name || !category || selectedMuscleGroups.length === 0) {
      return error('Please fill in all fields and select at least one muscle group');
    }

    setIsSubmitting(true);

    try {
      if (mode === 'add') {
        await createExercise({
          name,
          categories: category,
          muscleGroups: selectedMuscleGroups,
        });
      } else if (mode === 'edit' && exerciseId) {
        await updateExercise({
          id: exerciseId,
          name,
          categories: category,
          muscleGroups: selectedMuscleGroups,
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
            <ThemedText className="mb-2 text-lg font-semibold">Muscle Groups</ThemedText>
            <ThemedButton
              variant="secondary"
              size="md"
              onPress={showMuscleGroupPicker}
              className="mb-2">
              {selectedMuscleGroups.length > 0
                ? `Selected: ${selectedMuscleGroups.join(', ')}`
                : 'Select Muscle Groups'}
            </ThemedButton>
            {selectedMuscleGroups.length === 0 && (
              <ThemedText className="text-sm text-gray-500">
                Please select at least one muscle group
              </ThemedText>
            )}
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
