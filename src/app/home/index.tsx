import { useAuthActions } from '@convex-dev/auth/react';
import { View, Text, TouchableOpacity } from 'react-native';

import { ProtectedRoute } from '~/components/ProtectedRoute';

export default function HomeScreen() {
  const { signOut } = useAuthActions();

  return (
    <ProtectedRoute>
      <View className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="mb-4 text-center text-3xl font-bold text-neutral-900">
            Welcome to Gym Tracker
          </Text>
          <Text className="mb-8 text-center text-neutral-600">
            Start tracking your workouts and progress
          </Text>

          <TouchableOpacity className="bg-primary-500 mt-6 rounded-lg p-4" onPress={signOut}>
            <Text className="text-center text-lg font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProtectedRoute>
  );
}
