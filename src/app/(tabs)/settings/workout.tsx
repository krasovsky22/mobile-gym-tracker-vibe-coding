import { View, Text } from 'react-native';

import { Header } from '~/components/Header';
import { ProtectedRoute } from '~/components/ProtectedRoute';

export default function WorkoutSettingsScreen() {
  return (
    <ProtectedRoute>
      <View className="flex-1 bg-neutral-50">
        <Header title="Workout Settings" />
        <View className="flex-1 p-6">
          <Text className="mb-4 text-center text-3xl font-bold text-neutral-900">
            Workout Settings
          </Text>
          <Text className="text-center text-neutral-600">Configure your workout preferences</Text>
        </View>
      </View>
    </ProtectedRoute>
  );
}
