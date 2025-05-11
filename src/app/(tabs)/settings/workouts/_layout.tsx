import { Stack } from 'expo-router';
import { SafeAreaView, View } from 'react-native';

export default function SettingsWorkoutsLayout() {
  return (
    <SafeAreaView className="flex-1">
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
