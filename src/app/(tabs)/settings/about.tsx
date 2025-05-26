import { Linking, TouchableOpacity } from 'react-native';

import { ThemedText, ThemedView } from '~/theme';

export default function AboutScreen() {
  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/yourusername/mobile-gym-tracker-vibe');
  };

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedView className="mb-8">
        <ThemedText className="text-2xl font-bold">About</ThemedText>
      </ThemedView>

      <ThemedView className="space-y-4">
        <ThemedView className="rounded-lg border border-neutral-200 p-4">
          <ThemedText className="text-lg font-semibold">Version</ThemedText>
          <ThemedText className="text-neutral-500">1.0.0</ThemedText>
        </ThemedView>

        <ThemedView className="rounded-lg border border-neutral-200 p-4">
          <ThemedText className="text-lg font-semibold">Description</ThemedText>
          <ThemedText className="text-neutral-500">
            Gym Tracker is a mobile application designed to help you track your workouts and achieve
            your fitness goals.
          </ThemedText>
        </ThemedView>

        <ThemedView className="rounded-lg border border-neutral-200 p-4">
          <ThemedText className="text-lg font-semibold">Developer</ThemedText>
          <ThemedText className="text-neutral-500">Your Name</ThemedText>
        </ThemedView>

        <TouchableOpacity
          className="rounded-lg border border-neutral-200 p-4"
          onPress={handleOpenGitHub}>
          <ThemedText className="text-lg font-semibold">GitHub Repository</ThemedText>
          <ThemedText className="text-primary-500">
            github.com/yourusername/mobile-gym-tracker-vibe
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
