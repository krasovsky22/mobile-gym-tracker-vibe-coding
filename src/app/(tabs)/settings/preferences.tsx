import { useState } from 'react';
import { SafeAreaView, Switch } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '~/context/theme';
import { ThemedText, ThemedView } from '~/theme';

export default function PreferencesScreen() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <SafeAreaProvider>
      <ThemedView className="flex-1 p-4">
        <SafeAreaView className="flex-1">
          <ThemedView className="mb-8">
            <ThemedText className="text-2xl font-bold">Preferences</ThemedText>
          </ThemedView>

          <ThemedView className="gap-5 space-y-4">
            <ThemedView className="rounded-lg border border-neutral-200 p-4">
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView>
                  <ThemedText className="text-lg font-semibold">Dark Mode</ThemedText>
                  <ThemedText className="text-neutral-500">Enable dark theme</ThemedText>
                </ThemedView>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: '#767577', true: '#3b82f6' }}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView className="rounded-lg border border-neutral-200 p-4">
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView>
                  <ThemedText className="text-lg font-semibold">Notifications</ThemedText>
                  <ThemedText className="text-neutral-500">Receive workout reminders</ThemedText>
                </ThemedView>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#767577', true: '#3b82f6' }}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView className="rounded-lg border border-neutral-200 p-4">
              <ThemedView className="flex-row items-center justify-between">
                <ThemedView>
                  <ThemedText className="text-lg font-semibold">Sound Effects</ThemedText>
                  <ThemedText className="text-neutral-500">Play sounds during workouts</ThemedText>
                </ThemedView>
                <Switch
                  value={soundEffects}
                  onValueChange={setSoundEffects}
                  trackColor={{ false: '#767577', true: '#3b82f6' }}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
}
