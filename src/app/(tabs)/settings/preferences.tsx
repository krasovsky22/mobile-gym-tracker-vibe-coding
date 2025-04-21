import { View, Text, Switch } from 'react-native';
import { useState } from 'react';

export default function PreferencesScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-8">
        <Text className="text-2xl font-bold">Preferences</Text>
      </View>

      <View className="space-y-4">
        <View className="rounded-lg border border-gray-200 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold">Dark Mode</Text>
              <Text className="text-gray-600">Enable dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#3b82f6' }}
            />
          </View>
        </View>

        <View className="rounded-lg border border-gray-200 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold">Notifications</Text>
              <Text className="text-gray-600">Receive workout reminders</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#3b82f6' }}
            />
          </View>
        </View>

        <View className="rounded-lg border border-gray-200 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold">Sound Effects</Text>
              <Text className="text-gray-600">Play sounds during workouts</Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: '#767577', true: '#3b82f6' }}
            />
          </View>
        </View>
      </View>
    </View>
  );
} 
