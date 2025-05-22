import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAlert } from '~/context/alert';
import { ThemedButton, ThemedText, ThemedTextInput, ThemedView } from '~/theme';

export default function TrackWorkoutDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('trackedWorkoutId', id);
  const trackedWorkout = useQuery(api.trackedWorkouts.get, { id: id as Id<'trackedWorkouts'> })!;

  console.log('trackedWorkout', trackedWorkout);

  if (!trackedWorkout) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">{trackedWorkout.workout.name}</SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
