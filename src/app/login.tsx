import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { makeRedirectUri } from 'expo-auth-session';
import { router, useLocalSearchParams } from 'expo-router';
import { openAuthSessionAsync } from 'expo-web-browser';
import { Button, Platform, View, Text, Linking } from 'react-native';

import { Container } from '~/components/Container';

const redirectTo = makeRedirectUri();

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { isAuthenticated } = useConvexAuth();

  // If already authenticated, redirect to the target page
  if (isAuthenticated) {
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
      <View className="flex-1 items-center justify-center">
        <Text className="mb-4 text-xl font-bold">Sign in</Text>
        <Button onPress={handleSignIn} title="Sign in with GitHub" color="#24292e" />
      </View>
    </Container>
  );
}
