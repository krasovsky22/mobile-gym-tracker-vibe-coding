import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function SettingsWorkoutsLayout() {
  return (
    <SafeAreaProvider className="flex-1">
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
