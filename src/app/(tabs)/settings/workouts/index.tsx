import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';

type WorkoutExercise = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

type Workout = {
  _id: Id<'workouts'>;
  _creationTime: number;
  name: string;
  exercises: WorkoutExercise[];
};

export default function WorkoutsScreen() {
  const router = useRouter();
  const workouts = useQuery(api.workouts.list);
  const deleteWorkout = useMutation(api.workouts.remove);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (workoutId: Id<'workouts'>) => {
    Alert.alert('Delete Workout', 'Are you sure you want to delete this workout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteWorkout({ id: workoutId });
          } catch (error) {
            console.error('Error deleting workout:', error);
            Alert.alert('Error', 'Failed to delete workout');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleEdit = (workoutId: Id<'workouts'>) => {
    router.push(`/settings/workouts/${workoutId}/edit`);
  };

  const filteredWorkouts = workouts?.filter((workout: Workout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <TextInput
          className="rounded-lg border border-gray-200 p-3"
          placeholder="Search workouts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView className="flex-1 px-4">
        {filteredWorkouts?.map((workout: Workout) => (
          <View key={workout._id} className="mb-4 rounded-lg border border-gray-200 p-4">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold">{workout.name}</Text>
                <Text className="text-gray-600">{workout.exercises.length} exercises</Text>
                <Text className="text-gray-600">
                  Total sets:{' '}
                  {workout.exercises.reduce((sum: number, ex: WorkoutExercise) => sum + ex.sets, 0)}
                </Text>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className="rounded-lg bg-gray-200 px-3 py-2"
                  onPress={() => handleEdit(workout._id)}>
                  <Text className="font-semibold text-gray-700">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-lg bg-red-100 px-3 py-2"
                  onPress={() => handleDelete(workout._id)}
                  disabled={isDeleting}>
                  <Text className="font-semibold text-red-700">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="border-t border-gray-200 bg-white p-4">
        <TouchableOpacity
          className="rounded-lg bg-blue-500 p-4"
          onPress={() => router.push('/settings/workouts/add')}>
          <Text className="text-center font-semibold text-white">Create New Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
