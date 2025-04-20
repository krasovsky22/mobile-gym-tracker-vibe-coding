import {View, Text, TouchableOpacity} from 'react-native';

import {useAuthActions} from '@convex-dev/auth/react';
import {ProtectedRoute} from '~/components/ProtectedRoute';

export default function SettingsScreen() {
    const {signOut} = useAuthActions();

    return (
        <ProtectedRoute>
            <View className="flex-1 bg-neutral-50">
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="mb-4 text-center text-3xl font-bold text-neutral-900">
                        Settings
                    </Text>

                    <TouchableOpacity
                        className="mt-6 rounded-lg bg-primary-500 p-4"
                        onPress={signOut}
                    >
                        <Text className="text-center text-lg font-semibold text-white">
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ProtectedRoute>
    );
} 
