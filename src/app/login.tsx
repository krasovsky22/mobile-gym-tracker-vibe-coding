import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { makeRedirectUri } from 'expo-auth-session';
import { router, useLocalSearchParams } from 'expo-router';
import { openAuthSessionAsync } from 'expo-web-browser';
import { useEffect } from 'react';
import { Platform, TouchableOpacity, Linking } from 'react-native';

import { Container } from '~/components';
import { ThemedText, ThemedView } from '~/theme';

const redirectTo = makeRedirectUri();

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace(redirect || '/home');
    }
  }, [isAuthenticated, isLoading, redirect]);

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
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedView className="w-full max-w-sm space-y-6 px-4">
          <ThemedView className="space-y-2">
            <ThemedText className="text-center text-3xl font-bold">
              Welcome to Gym Tracker
            </ThemedText>
            <ThemedText className="text-center text-neutral-500">
              Track your workouts and achieve your fitness goals
            </ThemedText>
          </ThemedView>

          <TouchableOpacity className="w-full rounded-lg bg-primary-500 p-4" onPress={handleSignIn}>
            <ThemedText className="text-center text-lg font-semibold text-white">
              Sign in with GitHub
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Container>
  );
}
