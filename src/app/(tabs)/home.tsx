import {View, Text} from 'react-native';

import {ProtectedRoute} from '~/components/ProtectedRoute';

export default function HomeScreen() {
    return (
        <ProtectedRoute>
            <View className="flex-1 bg-neutral-50">
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="mb-4 text-center text-3xl font-bold text-neutral-900">
                        Welcome to Gym Tracker
                    </Text>
                    <Text className="text-center text-neutral-600">
                        Start tracking your workouts and progress
                    </Text>
                </View>
            </View>
        </ProtectedRoute>
    );
} 
