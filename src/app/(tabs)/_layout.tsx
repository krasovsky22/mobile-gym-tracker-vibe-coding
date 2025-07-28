import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProtectedRoute } from '~/components';
import { useTheme } from '~/context/theme';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const router = useRouter();

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
              href: '/home',
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
            listeners={{
              tabPress: (e) => {
                // Prevent default behavior
                e.preventDefault();

                // Reset the home navigation state and navigate to the index
                router.replace('/home');
              },
            }}
          />
          <Tabs.Screen
            name="track-workout"
            options={{
              href: '/track-workout',
              title: 'Track Workout',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="barbell-outline" size={size} color={color} />
              ),
            }}
            listeners={{
              tabPress: (e) => {
                // Prevent default behavior
                e.preventDefault();

                // Reset the track-workout navigation state and navigate to the index
                router.replace('/track-workout');
              },
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: '/settings',
              title: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
            listeners={{
              tabPress: (e) => {
                // Prevent default behavior
                e.preventDefault();

                // Reset the settings navigation state and navigate to the index
                router.replace('/settings');
              },
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </ProtectedRoute>
  );
}
