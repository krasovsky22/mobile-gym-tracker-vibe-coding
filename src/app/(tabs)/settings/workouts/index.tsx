import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, SafeAreaView, Pressable } from 'react-native';

import { WorkoutPreviewModal } from '~/components';
import { useAlert } from '~/context/alert';
import { ThemedText, ThemedButton, ThemedView, ThemedTextInput } from '~/theme';

type WorkoutExercise = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

type Workout = {
  _id: Id<'workouts'>;
  _creationTime: number;
  name: string;
  exercises: WorkoutExercise[];
  createdBy?: Id<'users'>;
};

export default function WorkoutsScreen() {
  const router = useRouter();
  const { confirm, error } = useAlert();
  const workouts = useQuery(api.workouts.list);
  const currentUser = useQuery(api.users.getCurrentUser);
  const deleteWorkout = useMutation(api.workouts.remove);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleWorkoutLongPress = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedWorkout(null);
  };

  const handleDelete = async (workoutId: Id<'workouts'>) => {
    if (isDeleting) return;

    const workout = workouts?.find((w) => w._id === workoutId);
    if (!workout) return;

    // Prevent deleting public workouts
    if (!workout.createdBy) {
      error('Cannot delete public workouts');
      return;
    }

    // Prevent deleting workouts not owned by the user
    if (currentUser && workout.createdBy !== currentUser._id) {
      error('You can only delete your own workouts');
      return;
    }

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
    const workout = workouts?.find((w) => w._id === workoutId);
    if (!workout) return;

    // Prevent editing public workouts
    if (!workout.createdBy) {
      error('Cannot edit public workouts');
      return;
    }

    // Prevent editing workouts not owned by the user
    if (currentUser && workout.createdBy !== currentUser._id) {
      error('You can only edit your own workouts');
      return;
    }

    router.push(`/settings/workouts/${workoutId}/edit`);
  };

  const filteredWorkouts = workouts?.filter((workout: Workout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPublicWorkout = (workout: Workout) => !workout.createdBy;

  const isOwnedByUser = (workout: Workout) => currentUser && workout.createdBy === currentUser._id;

  const canEditOrDelete = (workout: Workout) => !isPublicWorkout(workout) && isOwnedByUser(workout);

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
            <Pressable
              key={workout._id}
              onPressIn={() => handleWorkoutLongPress(workout)}
              onPressOut={() => closePreview()}
              className="mb-4"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}>
              <ThemedView className="rounded-lg border border-neutral-200 p-4">
                <ThemedView className="flex-row justify-between">
                  <ThemedView className="flex-1">
                    <ThemedView className="flex-row items-center gap-2">
                      <ThemedText className="text-lg font-semibold">{workout.name}</ThemedText>
                      {isPublicWorkout(workout) && (
                        <ThemedView className="rounded-full bg-blue-100 px-2 py-1">
                          <ThemedText className="text-xs font-medium text-blue-800">
                            Public
                          </ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>
                    <ThemedText className="text-neutral-600">
                      {workout.exercises.length} exercises
                    </ThemedText>
                    <ThemedText className="text-neutral-600">
                      Total sets:{' '}
                      {workout.exercises.reduce(
                        (sum: number, ex: WorkoutExercise) => sum + ex.sets,
                        0
                      )}
                    </ThemedText>
                    <ThemedText className="mt-1 text-xs text-neutral-500">
                      Long press to preview
                    </ThemedText>
                  </ThemedView>
                  {canEditOrDelete(workout) && (
                    <ThemedView className="flex-row items-center gap-1 space-x-2">
                      <ThemedButton
                        variant="secondary"
                        size="sm"
                        onPress={(e) => {
                          e?.stopPropagation?.();
                          handleEdit(workout._id);
                        }}>
                        Edit
                      </ThemedButton>
                      <ThemedButton
                        variant="danger"
                        size="sm"
                        onPress={(e) => {
                          e?.stopPropagation?.();
                          handleDelete(workout._id);
                        }}>
                        Delete
                      </ThemedButton>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>
            </Pressable>
          ))}
        </ScrollView>

        <WorkoutPreviewModal
          workout={selectedWorkout}
          visible={showPreview}
          onClose={closePreview}
        />

        <ThemedView className="border-t border-neutral-200 bg-white p-4">
          <ThemedButton variant="primary" onPress={() => router.push('/settings/workouts/add')}>
            Create Workout
          </ThemedButton>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}
