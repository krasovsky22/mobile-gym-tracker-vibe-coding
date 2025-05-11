import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProtectedRoute } from '~/components/ProtectedRoute';
import { useTheme } from '~/context/theme';

export default function TabLayout() {
  const { isDarkMode } = useTheme();

  return (
    <ProtectedRoute>
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b82f6',
            tabBarStyle: {
              backgroundColor: isDarkMode ? '#171717' : '#ffffff',
              borderTopColor: isDarkMode ? '#262626' : '#e5e7eb',
            },
            tabBarInactiveTintColor: isDarkMode ? '#a3a3a3' : '#6b7280',
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
