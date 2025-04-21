import { View, Text, Linking, TouchableOpacity } from 'react-native';

export default function AboutScreen() {
  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/yourusername/mobile-gym-tracker-vibe');
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-8">
        <Text className="text-2xl font-bold">About</Text>
      </View>

      <View className="space-y-4">
        <View className="rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold">Version</Text>
          <Text className="text-gray-600">1.0.0</Text>
        </View>

        <View className="rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold">Description</Text>
          <Text className="text-gray-600">
            Gym Tracker is a mobile application designed to help you track your workouts and achieve your fitness goals.
          </Text>
        </View>

        <View className="rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold">Developer</Text>
          <Text className="text-gray-600">Your Name</Text>
        </View>

        <TouchableOpacity
          className="rounded-lg border border-gray-200 p-4"
          onPress={handleOpenGitHub}
        >
          <Text className="text-lg font-semibold">GitHub Repository</Text>
          <Text className="text-blue-500">github.com/yourusername/mobile-gym-tracker-vibe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 
