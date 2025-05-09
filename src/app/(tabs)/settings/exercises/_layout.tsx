import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function SettingsExercisesLayout() {
  return (
    <View className="mt-6 flex-1 bg-white">
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </View>
  );
}
