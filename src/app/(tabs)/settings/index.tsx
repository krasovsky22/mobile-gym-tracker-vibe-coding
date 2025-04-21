import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white p-4">
        <View className="mb-8">
          <Text className="text-center text-2xl font-bold">Settings</Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/exercises')}>
            <Text className="text-lg font-semibold">Exercises</Text>
            <Text className="text-gray-600">Manage your exercise library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/account')}>
            <Text className="text-lg font-semibold">Account</Text>
            <Text className="text-gray-600">Manage your account settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/preferences')}>
            <Text className="text-lg font-semibold">Preferences</Text>
            <Text className="text-gray-600">Customize your app experience</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg border border-gray-200 p-4"
            onPress={() => router.push('/settings/about')}>
            <Text className="text-lg font-semibold">About</Text>
            <Text className="text-gray-600">App version 1.0.0</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-8 rounded-lg bg-red-500 p-4" onPress={signOut}>
          <Text className="text-center font-semibold text-white">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}
