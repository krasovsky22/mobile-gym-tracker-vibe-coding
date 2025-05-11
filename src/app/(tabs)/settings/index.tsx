import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';

export default function SettingsScreen() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <ThemedView className="flex-1 p-4">
        <ThemedView className="mb-8">
          <ThemedText className="text-center text-2xl font-bold">Settings</ThemedText>
        </ThemedView>

        <ThemedView className="gap-5 space-y-4">
          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/exercises')}>
            <ThemedText className="text-lg font-semibold">Exercises</ThemedText>
            <ThemedText className="text-neutral-500">Manage your exercise library</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/workouts')}>
            <ThemedText className="text-lg font-semibold">Workouts</ThemedText>
            <ThemedText className="text-neutral-500">Manage your workout library</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/account')}>
            <ThemedText className="text-lg font-semibold">Account</ThemedText>
            <ThemedText className="text-neutral-500">Manage your account settings</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/preferences')}>
            <ThemedText className="text-lg font-semibold">Preferences</ThemedText>
            <ThemedText className="text-neutral-500">Customize your app experience</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/about')}>
            <ThemedText className="text-lg font-semibold">About</ThemedText>
            <ThemedText className="text-neutral-500">App version 1.0.0</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity className="mt-8 rounded-lg bg-red-500 p-4" onPress={signOut}>
          <ThemedText className="text-center font-semibold text-white">Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaProvider>
  );
}
