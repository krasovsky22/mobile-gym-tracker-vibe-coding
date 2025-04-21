import { useAuthActions } from '@convex-dev/auth/react';
import { router } from 'expo-router';
import { User, Dumbbell, Settings as SettingsIcon, LogOut } from 'lucide-react-native';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { ProtectedRoute } from '~/components/ProtectedRoute';

interface SettingsMenuItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
}

function SettingsMenuItem({ title, description, icon, onPress }: SettingsMenuItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center space-x-4 rounded-lg bg-white p-4 shadow-sm"
      onPress={onPress}>
      <View className="bg-primary-100 rounded-lg p-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
        <Text className="text-sm text-neutral-600">{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuthActions();

  return (
    <ProtectedRoute>
      <View className="flex-1 bg-neutral-50">
        <ScrollView className="flex-1 p-6">
          <Text className="mb-6 text-3xl font-bold text-neutral-900">Settings</Text>

          <View className="space-y-4">
            <SettingsMenuItem
              title="Update Profile"
              description="Change your personal information"
              icon={<User size={24} color="#0ea5e9" />}
              onPress={() => router.push('/settings/update-user')}
            />

            <SettingsMenuItem
              title="Exercise Settings"
              description="Manage your exercise library"
              icon={<Dumbbell size={24} color="#0ea5e9" />}
              onPress={() => router.push('/settings/exercises')}
            />

            <SettingsMenuItem
              title="Workout Settings"
              description="Configure your workout preferences"
              icon={<SettingsIcon size={24} color="#0ea5e9" />}
              onPress={() => router.push('/settings/workout')}
            />

            <SettingsMenuItem
              title="Logout"
              description="Sign out of your account"
              icon={<LogOut size={24} color="#ef4444" />}
              onPress={signOut}
            />
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
