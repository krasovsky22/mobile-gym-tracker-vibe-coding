import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';

import { ThemedButton } from '~/components/ThemedButton';
import { ThemedText } from '~/components/ThemedText';
import { ThemedTextInput } from '~/components/ThemedTextInput';
import { ThemedView } from '~/components/ThemedView';
import { useAlert } from '~/context/alert';

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
  const { confirm, error } = useAlert();
  const workouts = useQuery(api.workouts.list);
  const deleteWorkout = useMutation(api.workouts.remove);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (workoutId: Id<'workouts'>) => {
    if (isDeleting) return;

    confirm('Delete Workout', 'Are you sure you want to delete this workout?', async () => {
      try {
        setIsDeleting(true);
        await deleteWorkout({ id: workoutId });
      } catch (err) {
        console.error('Error deleting workout:', err);
        error('Failed to delete workout');
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const handleEdit = (workoutId: Id<'workouts'>) => {
    router.push(`/settings/workouts/${workoutId}/edit`);
  };

  const filteredWorkouts = workouts?.filter((workout: Workout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <ThemedView className="p-4">
          <ThemedTextInput
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </ThemedView>

        <ScrollView className="flex-1 px-4">
          {filteredWorkouts?.map((workout: Workout) => (
            <ThemedView key={workout._id} className="mb-4 rounded-lg border border-gray-200 p-4">
              <ThemedView className="flex-row justify-between">
                <ThemedView className="flex-1">
                  <ThemedText className="text-lg font-semibold">{workout.name}</ThemedText>
                  <ThemedText className="text-gray-600">
                    {workout.exercises.length} exercises
                  </ThemedText>
                  <ThemedText className="text-gray-600">
                    Total sets:{' '}
                    {workout.exercises.reduce(
                      (sum: number, ex: WorkoutExercise) => sum + ex.sets,
                      0
                    )}
                  </ThemedText>
                </ThemedView>
                <ThemedView className="flex-row items-center gap-1 space-x-2">
                  <ThemedButton
                    variant="secondary"
                    size="sm"
                    onPress={() => handleEdit(workout._id)}>
                    Edit
                  </ThemedButton>
                  <ThemedButton
                    variant="danger"
                    size="sm"
                    onPress={() => handleDelete(workout._id)}>
                    Delete
                  </ThemedButton>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}
        </ScrollView>

        <ThemedView className="border-t border-gray-200 bg-white p-4">
          <ThemedButton variant="primary" onPress={() => router.push('/settings/workouts/create')}>
            Create Workout
          </ThemedButton>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}
