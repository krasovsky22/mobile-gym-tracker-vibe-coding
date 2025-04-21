import {Stack} from 'expo-router';
import {ProtectedRoute} from "~/components/ProtectedRoute";

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
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
                name="settins/rexercises"
                options={{
                    title: 'Manage Exercises',
                }}
            />
        </Stack>
    );
}
