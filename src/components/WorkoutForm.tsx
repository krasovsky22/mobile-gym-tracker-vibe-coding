import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

import ExerciseSelectModal from './ExerciseSelectModal';

type WorkoutExercise = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

type WorkoutFormProps = {
  mode: 'add' | 'edit';
  workoutId?: Id<'workouts'>;
  initialData?: {
    name: string;
    exercises: WorkoutExercise[];
  };
};

export default function WorkoutForm({ mode, workoutId, initialData }: WorkoutFormProps) {
  const router = useRouter();
  const createWorkout = useMutation(api.workouts.create);
  const updateWorkout = useMutation(api.workouts.update);

  const [name, setName] = useState(initialData?.name || '');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    initialData?.exercises || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setWorkoutExercises(initialData.exercises);
    }
  }, [initialData]);

  const handleAddExercise = () => {
    setShowExerciseDialog(true);
  };

  const handleSelectExercise = (exerciseId: Id<'exercises'>) => {
    setWorkoutExercises([...workoutExercises, { exerciseId, sets: 3 }]);
    setShowExerciseDialog(false);
  };

  const handleRemoveExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (
    index: number,
    field: 'exerciseId' | 'sets',
    value: string | number
  ) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setWorkoutExercises(updatedExercises);
  };

  const handleSubmit = async () => {
    if (!name || workoutExercises.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and add at least one exercise');
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === 'add') {
        await createWorkout({
          name,
          exercises: workoutExercises,
        });
      } else if (mode === 'edit' && workoutId) {
        await updateWorkout({
          id: workoutId,
          name,
          exercises: workoutExercises,
        });
      }
      router.back();
    } catch (error) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} workout:`, error);
      Alert.alert('Error', `Failed to ${mode === 'add' ? 'create' : 'update'} workout`);
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
          {mode === 'add' ? 'Create Workout' : 'Edit Workout'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="mb-4">
          <Text className="mb-2 text-lg font-semibold">Workout Name</Text>
          <TextInput
            className="rounded-lg border border-gray-300 p-3"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Upper Body Workout"
          />
        </View>

        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold">Exercises</Text>
            <TouchableOpacity
              className="rounded-lg bg-blue-500 px-3 py-2"
              onPress={handleAddExercise}>
              <Text className="font-semibold text-white">Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {workoutExercises.map((exercise, index) => (
            <View key={index} className="mb-4 rounded-lg border border-gray-200 p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-lg font-semibold">Exercise {index + 1}</Text>
                <TouchableOpacity
                  className="rounded-lg bg-red-100 px-3 py-2"
                  onPress={() => handleRemoveExercise(index)}>
                  <Text className="font-semibold text-red-700">Remove</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-2">
                <Text className="mb-1 text-gray-600">Exercise</Text>
                <View className="rounded-lg border border-gray-300 p-3">
                  <Text>{exercise.exerciseId ? 'Selected' : 'Select an exercise'}</Text>
                </View>
              </View>

              <View>
                <Text className="mb-1 text-gray-600">Number of Sets</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 p-3"
                  value={exercise.sets.toString()}
                  onChangeText={(value) =>
                    handleUpdateExercise(index, 'sets', parseInt(value, 10) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="e.g., 3"
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-gray-200 bg-white p-4">
        <TouchableOpacity
          className={`rounded-lg p-4 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <Text className="text-center font-semibold text-white">
            {isSubmitting
              ? `${mode === 'add' ? 'Creating' : 'Updating'}...`
              : `${mode === 'add' ? 'Create' : 'Update'} Workout`}
          </Text>
        </TouchableOpacity>
      </View>

      <ExerciseSelectModal
        visible={showExerciseDialog}
        onClose={() => setShowExerciseDialog(false)}
        onSelect={handleSelectExercise}
        selectedExercises={workoutExercises}
      />
    </View>
  );
}
