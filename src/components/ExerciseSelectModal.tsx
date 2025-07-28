import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '../context/alert';

import { ThemedButton, ThemedText, ThemedView } from '~/theme';

type WorkoutExercise = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

type ExerciseSelectModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseId: Id<'exercises'>) => void;
  selectedExercises: WorkoutExercise[];
};

export default function ExerciseSelectModal({
  visible,
  onClose,
  onSelect,
  selectedExercises,
}: ExerciseSelectModalProps) {
  const { error } = useAlert();
  const exercises = useQuery(api.exercises.list);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
    }
  }, [visible]);

  // Add loading state handling
  if (exercises === undefined) {
    return null; // Still loading
  }

  // Only show error if we get null after loading (actual error)
  if (exercises === null) {
    error('Failed to load exercises');
    return null;
  }

  const selectedExerciseIds = selectedExercises.map((ex) => ex.exerciseId);

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedExerciseIds.includes(exercise._id)
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <ThemedView className="flex-row items-center p-4 border-b border-neutral-200">
          <ThemedButton onPress={onClose} className="mr-4" variant="secondary">
            Close
          </ThemedButton>
          <ThemedText className="text-xl font-semibold">Select Exercise</ThemedText>
        </ThemedView>

        <ThemedView className="flex-1 p-4">
          <TextInput
            className="p-3 mb-4 border rounded-lg border-neutral-300"
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView className="flex-1">
            {filteredExercises?.length === 0 ? (
              <ThemedText className="text-center text-neutral-500">No exercises found</ThemedText>
            ) : (
              filteredExercises?.map((exercise) => (
                <TouchableOpacity
                  key={exercise._id}
                  className="p-4 mb-2 border rounded-lg border-neutral-200"
                  onPress={() => onSelect(exercise._id)}>
                  <ThemedText className="text-lg font-semibold">{exercise.name}</ThemedText>
                  <ThemedText className="text-neutral-600">{exercise.category}</ThemedText>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}
