import { Stack } from 'expo-router';
import { SafeAreaView, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function SettingsExercisesLayout() {
  return (
    <SafeAreaProvider className="flex-1 bg-white ">
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
    </SafeAreaProvider>
  );
}
