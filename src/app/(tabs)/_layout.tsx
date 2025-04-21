import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProtectedRoute } from '~/components/ProtectedRoute';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b82f6',
          }}>
          <Tabs.Screen
            name="home/index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="track-workout"
            options={{
              title: 'Track Workout',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="barbell-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </ProtectedRoute>
  );
}
