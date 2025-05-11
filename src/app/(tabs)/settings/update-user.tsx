import { View, Text } from 'react-native';

import { Header, ProtectedRoute } from '~/components';

export default function UpdateUserScreen() {
  return (
    <ProtectedRoute>
      <View className="flex-1 bg-neutral-50">
        <Header title="Update Profile" />
        <View className="flex-1 p-6">
          <Text className="mb-4 text-center text-3xl font-bold text-neutral-900">
            Update Profile
          </Text>
          <Text className="text-center text-neutral-600">Update your personal information</Text>
        </View>
      </View>
    </ProtectedRoute>
  );
}
