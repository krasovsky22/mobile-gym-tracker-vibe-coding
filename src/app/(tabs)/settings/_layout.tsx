import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
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
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Account Settings',
        }}
      />
      <Stack.Screen
        name="preferences"
        options={{
          title: 'Preferences',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About',
        }}
      />
      <Stack.Screen
        name="exercises"
        options={{
          title: 'Manage Exercises',
        }}
      />
    </Stack>
  );
}
