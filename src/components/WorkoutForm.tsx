import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { TextInput, TouchableOpacity, ScrollView } from 'react-native';

import { useAlert } from './AlertProvider';
import ExerciseSelectModal from './ExerciseSelectModal';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type WorkoutExercise = {
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
  const { error } = useAlert();
  const scrollViewRef = useRef<ScrollView>(null);
  const createWorkout = useMutation(api.workouts.create);
  const updateWorkout = useMutation(api.workouts.update);
  const exercisesList = useQuery(api.exercises.list);

  const [name, setName] = useState(initialData?.name || '');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    initialData?.exercises || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [editExerciseIndex, setEditExerciseIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setWorkoutExercises(initialData.exercises);
    }
  }, [initialData]);

  const handleAddExercise = () => {
    setShowExerciseDialog(true);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSelectExercise = (exerciseId: Id<'exercises'>) => {
    const selectedExercise = exercisesList?.find((exercise) => exercise._id === exerciseId);
    if (selectedExercise) {
      setWorkoutExercises((prev) => {
        if (editExerciseIndex !== null) {
          // Update the exercise at the edit index
          return prev.map((exercise, index) =>
            index === editExerciseIndex
              ? { exerciseId, sets: exercise.sets, ...selectedExercise }
              : exercise
          );
        }
        // Add a new exercise if not editing
        return [
          ...prev,
          {
            exerciseId,
            sets: 3,
            ...selectedExercise,
          },
        ];
      });
    }
    setShowExerciseDialog(false);
    setEditExerciseIndex(null); // Reset edit index after selection

    // Only scroll when adding a new exercise, not when editing
    if (editExerciseIndex === null) {
      scrollToBottom();
    }
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

  const handleEditExercise = (index: number) => {
    const exerciseToEdit = workoutExercises[index];
    setShowExerciseDialog(true);
    setEditExerciseIndex(index);
    setWorkoutExercises((prev) =>
      prev.map((exercise, i) => (i === index ? { ...exerciseToEdit } : exercise))
    );
  };

  const handleSubmit = async () => {
    if (!name || workoutExercises.length === 0) {
      error('Please fill in all fields and add at least one exercise');
      return;
    }

    try {
      setIsSubmitting(true);
      const exercises = workoutExercises.map(({ exerciseId, sets }) => ({
        exerciseId,
        sets,
      }));

      if (mode === 'add') {
        await createWorkout({
          name,
          exercises,
        });
      } else if (mode === 'edit' && workoutId) {
        await updateWorkout({
          id: workoutId,
          name,
          exercises,
        });
      }
      router.replace('/settings/workouts');
    } catch (err) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} workout:`, err);
      error(`Failed to ${mode === 'add' ? 'create' : 'update'} workout`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView className="flex-1">
      <ThemedView className="flex-row items-center border-b border-gray-200 p-4">
        <TouchableOpacity
          className="mr-4 rounded-lg bg-gray-100 px-4 py-2"
          onPress={() => router.replace('/settings/workouts')}>
          <ThemedText className="font-semibold text-gray-700">Back</ThemedText>
        </TouchableOpacity>
        <ThemedText className="text-xl font-semibold">
          {mode === 'add' ? 'Create Workout' : 'Edit Workout'}
        </ThemedText>
      </ThemedView>

      <ScrollView ref={scrollViewRef} className="flex-1 p-4">
        <ThemedView className="mb-4">
          <ThemedText className="mb-2 text-lg font-semibold">Workout Name</ThemedText>
          <TextInput
            className="rounded-lg border border-gray-300 p-3"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Upper Body Workout"
          />
        </ThemedView>

        <ThemedView className="mb-4">
          <ThemedView className="mb-2 flex-row items-center justify-between">
            <ThemedText className="text-lg font-semibold">Exercises</ThemedText>
          </ThemedView>

          {workoutExercises.map((workoutExercise, index) => {
            const exercise = exercisesList?.find((ex) => ex._id === workoutExercise.exerciseId);
            if (!exercise) {
              return null; // Skip rendering if exercise is not found
            }
            return (
              <ThemedView key={index} className="mb-4 rounded-lg border border-gray-200 p-4">
                <ThemedView className="mb-2 flex-row items-center justify-between gap-2">
                  <ThemedView className="flex flex-1 flex-row gap-1 text-lg font-semibold">
                    <ThemedText className="flex-1">
                      {index + 1} {exercise.name || 'No exercise selected'}
                    </ThemedText>
                    <ThemedText>Muscle Group</ThemedText>
                    <ThemedText className="text-neutral-500">
                      {exercise.muscleGroup || 'N/A'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView className="flex-row">
                    <TouchableOpacity
                      className="mr-2 rounded-lg bg-yellow-100 px-3 py-2"
                      onPress={() => handleEditExercise(index)}>
                      <ThemedText className="font-semibold text-yellow-700">Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-lg bg-red-100 px-3 py-2"
                      onPress={() => handleRemoveExercise(index)}>
                      <ThemedText className="font-semibold text-red-700">Remove</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>

                <ThemedView className="flex flex-row items-center gap-2">
                  <ThemedView className="flex-1">
                    <ThemedText className=" text-gray-600">Number of Sets</ThemedText>
                  </ThemedView>
                  <TextInput
                    className="w-16 rounded-lg border border-gray-300 p-3 text-center"
                    value={workoutExercise.sets.toString()}
                    onChangeText={(value) =>
                      handleUpdateExercise(index, 'sets', parseInt(value, 10) || 0)
                    }
                    keyboardType="numeric"
                    maxLength={3}
                    placeholder="e.g., 3"
                  />
                </ThemedView>
              </ThemedView>
            );
          })}
        </ThemedView>
      </ScrollView>

      <ThemedView className="space-y-4 p-4">
        <TouchableOpacity className="rounded-lg bg-blue-500 px-3 py-2" onPress={handleAddExercise}>
          <ThemedText className="text-center font-semibold text-white">Add Exercise</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView className="space-y-4 border-t border-gray-200 bg-white p-4">
        <TouchableOpacity
          className={`rounded-lg p-4 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <ThemedText className="text-center font-semibold text-white">
            {isSubmitting
              ? `${mode === 'add' ? 'Creating' : 'Updating'}...`
              : `${mode === 'add' ? 'Create' : 'Update'} Workout`}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ExerciseSelectModal
        visible={showExerciseDialog}
        onClose={() => setShowExerciseDialog(false)}
        onSelect={handleSelectExercise}
        selectedExercises={workoutExercises}
      />
    </ThemedView>
  );
}
