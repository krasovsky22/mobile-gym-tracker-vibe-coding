import { api } from 'convex/_generated/api';
import { useConvexAuth, useQuery } from 'convex/react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function AccountSettingsScreen() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-8">
        <Text className="text-2xl font-bold">Account Settings</Text>
      </View>

      <View className="space-y-4">
        <View className="rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold">Profile</Text>
          <Text className="text-gray-600">Email: {user.email}</Text>
          <Text className="text-gray-600">Name: {user.name}</Text>
        </View>

        <View className="rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold">Security</Text>
          <Text className="text-gray-600">Change password</Text>
          <Text className="text-gray-600">Two-factor authentication</Text>
        </View>

        <View className="rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold">Connected Accounts</Text>
          <Text className="text-gray-600">GitHub: Connected</Text>
        </View>
      </View>
    </View>
  );
}
