import { api } from 'convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Dumbbell } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';

import { Header } from '~/components/Header';
import { ProtectedRoute } from '~/components/ProtectedRoute';

interface Exercise {
  _id: string;
  _creationTime: number;
  name: string;
  category: string;
  muscleGroup: string;
  createdAt: number;
  updatedAt: number;
}

export default function ExercisesSettingsScreen() {
  const [newExercise, setNewExercise] = useState({
    name: '',
    category: '',
    muscleGroup: '',
  });

  const exercises = useQuery(api.exercises.list);
  const createExercise = useMutation(api.exercises.create);

  const handleAddExercise = async () => {
    if (!newExercise.name || !newExercise.category || !newExercise.muscleGroup) {
      return;
    }

    try {
      await createExercise(newExercise);
      setNewExercise({ name: '', category: '', muscleGroup: '' });
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };

  return (
    <ProtectedRoute>
      <View className="flex-1 bg-neutral-50">
        <Header title="Exercise Settings" />
        <ScrollView className="flex-1">
          <View className="p-6">
            <View className="mb-6 space-y-4">
              <TextInput
                className="rounded-lg bg-white p-4 text-neutral-900 shadow-sm"
                placeholder="Exercise Name"
                value={newExercise.name}
                onChangeText={(text) => setNewExercise({ ...newExercise, name: text })}
              />
              <TextInput
                className="rounded-lg bg-white p-4 text-neutral-900 shadow-sm"
                placeholder="Category"
                value={newExercise.category}
                onChangeText={(text) => setNewExercise({ ...newExercise, category: text })}
              />
              <TextInput
                className="rounded-lg bg-white p-4 text-neutral-900 shadow-sm"
                placeholder="Muscle Group"
                value={newExercise.muscleGroup}
                onChangeText={(text) => setNewExercise({ ...newExercise, muscleGroup: text })}
              />
              <TouchableOpacity
                className="bg-primary-500 flex-row items-center justify-center rounded-lg p-4"
                onPress={handleAddExercise}>
                <Plus size={20} color="#ffffff" />
                <Text className="ml-2 text-lg font-semibold text-white">Add Exercise</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <Text className="text-xl font-semibold text-neutral-900">Your Exercises</Text>
              {exercises?.map((exercise: Exercise) => (
                <View
                  key={exercise._id}
                  className="flex-row items-center space-x-4 rounded-lg bg-white p-4 shadow-sm">
                  <View className="bg-primary-100 rounded-lg p-3">
                    <Dumbbell size={24} color="#0ea5e9" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-neutral-900">{exercise.name}</Text>
                    <Text className="text-sm text-neutral-600">
                      {exercise.category} • {exercise.muscleGroup}
                    </Text>
                    <Text className="mt-1 text-xs text-neutral-500">
                      Updated {new Date(exercise.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
