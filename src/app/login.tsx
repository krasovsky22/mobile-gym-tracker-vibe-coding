import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { makeRedirectUri } from 'expo-auth-session';
import { router, useLocalSearchParams } from 'expo-router';
import { openAuthSessionAsync } from 'expo-web-browser';
import { Platform, View, Text, TouchableOpacity, Linking } from 'react-native';

import { Container } from '~/components/Container';

const redirectTo = makeRedirectUri();

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { isAuthenticated, isLoading } = useConvexAuth();

  // If already authenticated, redirect to the target page
  if (isAuthenticated && !isLoading) {
    router.replace(redirect || '/home');
    return null;
  }

  const handleSignIn = async () => {
    try {
      const response = await signIn('github', { redirectTo });

      if (!response.redirect) {
        return;
      }

      if (Platform.OS === 'web') {
        await Linking.openURL(response.redirect.toString());
        return;
      }

      const result = await openAuthSessionAsync(response.redirect.toString(), redirectTo);

      if (result.type === 'success') {
        const { url } = result;
        const code = new URL(url).searchParams.get('code');
        if (!code) {
          return;
        }
        await signIn('github', { code });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Sign in error:', error);
      }
    }
  };

  return (
    <Container>
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <View className="w-full max-w-sm space-y-6 px-4">
          <View className="space-y-2">
            <Text className="text-center text-3xl font-bold text-neutral-900">
              Welcome to Gym Tracker
            </Text>
            <Text className="text-center text-neutral-600">
              Track your workouts and achieve your fitness goals
            </Text>
          </View>

          <TouchableOpacity className="bg-primary-500 w-full rounded-lg p-4" onPress={handleSignIn}>
            <Text className="text-center text-lg font-semibold text-white">
              Sign in with GitHub
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
