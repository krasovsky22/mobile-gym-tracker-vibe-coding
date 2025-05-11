import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AlertProvider } from '~/components/AlertProvider';
import { ThemeProvider } from '~/components/ThemeProvider';
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
    <ThemeProvider>
      <ConvexAuthProvider
        client={convex}
        storage={Platform.OS === 'android' || Platform.OS === 'ios' ? secureStorage : undefined}>
        <SafeAreaProvider>
          <AlertProvider>
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
            </Stack>
          </AlertProvider>
        </SafeAreaProvider>
      </ConvexAuthProvider>
    </ThemeProvider>
  );
}
