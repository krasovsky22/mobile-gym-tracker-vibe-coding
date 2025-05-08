import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';

import { useAlert } from './AlertProvider';

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

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
    }
  }, [visible]);

  if (!exercises) {
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
      <View className="flex-1 bg-white">
        <View className="flex-row items-center border-b border-gray-200 p-4">
          <TouchableOpacity className="mr-4 rounded-lg bg-gray-100 px-4 py-2" onPress={onClose}>
            <Text className="font-semibold text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Select Exercise</Text>
        </View>

        <View className="flex-1 p-4">
          <TextInput
            className="mb-4 rounded-lg border border-gray-300 p-3"
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView className="flex-1">
            {filteredExercises?.length === 0 ? (
              <Text className="text-center text-gray-500">No exercises found</Text>
            ) : (
              filteredExercises?.map((exercise) => (
                <TouchableOpacity
                  key={exercise._id}
                  className="mb-2 rounded-lg border border-gray-200 p-4"
                  onPress={() => onSelect(exercise._id)}>
                  <Text className="text-lg font-semibold">{exercise.name}</Text>
                  <Text className="text-gray-600">{exercise.category}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
