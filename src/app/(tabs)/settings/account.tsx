import { api } from 'convex/_generated/api';
import { useConvexAuth, useQuery } from 'convex/react';
import { SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';

export default function AccountSettingsScreen() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemedView className="flex-1 p-4">
        <SafeAreaView className="flex-1">
          <ThemedView className="mb-8">
            <ThemedText className="text-2xl font-bold">Account Settings</ThemedText>
          </ThemedView>

          <ThemedView className="gap-5 space-y-4">
            <ThemedView className="rounded-lg border border-gray-200 p-4">
              <ThemedText className="text-lg font-semibold">Profile</ThemedText>
              <ThemedText className="text-neutral-500">Email: {user.email}</ThemedText>
              <ThemedText className="text-neutral-500">Name: {user.name}</ThemedText>
            </ThemedView>

            <ThemedView className="rounded-lg border border-gray-200 p-4">
              <ThemedText className="text-lg font-semibold">Security</ThemedText>
              <ThemedText className="text-neutral-500">Change password</ThemedText>
              <ThemedText className="text-neutral-500">Two-factor authentication</ThemedText>
            </ThemedView>

            <ThemedView className="rounded-lg border border-gray-200 p-4">
              <ThemedText className="text-lg font-semibold">Connected Accounts</ThemedText>
              <ThemedText className="text-neutral-500">GitHub: Connected</ThemedText>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
