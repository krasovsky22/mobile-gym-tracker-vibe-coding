import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { View, Text, TouchableOpacity } from 'react-native';

import { ProtectedRoute } from '~/components/ProtectedRoute';

export default function HomeScreen() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <ProtectedRoute>
      <View className="flex-1 bg-white p-6">
        <View className="flex-1 justify-center">
          <Text className="mb-4 text-center text-2xl font-bold">Welcome to Gym Tracker</Text>
          <TouchableOpacity 
            className="mt-6 rounded-lg bg-red-500 p-4" 
            onPress={signOut}
          >
            <Text className="text-center font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProtectedRoute>
  );
}
