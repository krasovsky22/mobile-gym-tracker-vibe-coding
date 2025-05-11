import { Stack } from 'expo-router';
import { SafeAreaView, View } from 'react-native';

export default function SettingsExercisesLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white ">
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
    </SafeAreaView>
  );
}
