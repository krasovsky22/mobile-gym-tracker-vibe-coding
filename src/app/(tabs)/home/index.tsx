import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthActions } from '@convex-dev/auth/react';

export default function HomeScreen() {
  const { signOut } = useAuthActions();

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 items-center justify-center">
        <Text className="mb-4 text-2xl font-bold">Welcome to Gym Tracker</Text>
        <Text className="mb-8 text-center text-gray-600">
          Track your workouts and achieve your fitness goals
        </Text>
      </View>

      <TouchableOpacity 
        className="rounded-lg bg-red-500 p-4" 
        onPress={signOut}
      >
        <Text className="text-center font-semibold text-white">
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
} 
