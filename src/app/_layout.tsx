import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import 'global.css';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ConvexAuthProvider
        client={convex}
        storage={Platform.OS === 'android' || Platform.OS === 'ios' ? secureStorage : undefined}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="exercises"
            options={{
              headerShown: true,
              title: 'Exercises',
            }}
          />
          <Stack.Screen
            name="exercises/add"
            options={{
              headerShown: true,
              title: 'Add Exercise',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="exercises/[id]"
            options={{
              headerShown: true,
              title: 'Edit Exercise',
              presentation: 'modal',
            }}
          />
        </Stack>
      </ConvexAuthProvider>
    </SafeAreaProvider>
  );
}
