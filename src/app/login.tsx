import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { Asset, useAssets } from 'expo-asset';
import { makeRedirectUri } from 'expo-auth-session';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { openAuthSessionAsync } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform, Linking, Modal, ImageBackground, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Container } from '~/components';
import { ThemedText, ThemedView, ThemedTextInput, ThemedButton } from '~/theme';

const redirectTo = makeRedirectUri();

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);

  const [assets, error] = useAssets([require('~assets/login-motivation.png')]);

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

  const handleUsernamePasswordSignIn = () => {
    // TODO: Implement username/password authentication
    console.log('Username/Password sign in:', { username, password });
    setIsUsernameModalVisible(false);
  };

  const openUsernameModal = () => {
    setIsUsernameModalVisible(true);
  };

  const closeUsernameModal = () => {
    setIsUsernameModalVisible(false);
    setUsername('');
    setPassword('');
  };

  return (
    <Container>
      <ThemedView className="flex-1 bg-[#121516]">
        <SafeAreaView className="flex-1">
          {/* Background Image Section - Method 1: Direct require (Recommended) */}
          <ImageBackground
            source={require('~assets/login-motivation.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
            className="absolute inset-0">
            {/* Content Overlay */}
          </ImageBackground>

          <ThemedView className="flex-1 justify-end" transparent>
            <ThemedView className="" transparent>
              {/* Main Content */}
              <ThemedView className="gap-2 px-4 pb-6" transparent>
                {/* Header */}
                <ThemedText className="pb-3 pt-5 text-center text-[28px] font-bold leading-tight text-white">
                  Welcome back
                </ThemedText>
                <ThemedText className="pb-3 pt-1 text-center text-base font-normal leading-normal text-white">
                  Sign in to continue your fitness journey
                </ThemedText>

                {/* Social Login Buttons */}
                <ThemedView className="mx-auto w-full gap-2 space-y-3" transparent>
                  <ThemedButton
                    variant="secondary"
                    size="md"
                    fullWidth
                    icon="logo-google"
                    className="h-10 rounded-full border border-[#dadce0] bg-white"
                    onPress={() => {}}>
                    <ThemedText className="text-sm font-semibold">Continue with Google</ThemedText>
                  </ThemedButton>

                  <ThemedButton
                    variant="secondary"
                    size="md"
                    fullWidth
                    icon="logo-github"
                    className="h-10 rounded-full border border-[#30363d] bg-[#24292f]"
                    onPress={handleSignIn}>
                    Continue with GitHub
                  </ThemedButton>
                </ThemedView>

                {/* Divider */}
                <ThemedText className="pb-3 pt-1 text-center text-sm font-normal leading-normal ">
                  or
                </ThemedText>

                {/* Username/Password Button */}
                <ThemedButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  className="h-10 rounded-full bg-[#2c3135]"
                  onPress={openUsernameModal}>
                  Continue with Username/Password
                </ThemedButton>

                {/* Sign Up Link */}
                <ThemedButton variant="outline" size="sm" className="border-0 pb-3 pt-1">
                  <ThemedText className="text-center text-sm font-normal underline">
                    Don't have an account? Sign up
                  </ThemedText>
                </ThemedButton>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </SafeAreaView>

        {/* Username/Password Modal */}
        <Modal
          visible={isUsernameModalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeUsernameModal}>
          <ThemedView className="flex-1 justify-end bg-black/50">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1 justify-end">
              <ThemedView className="rounded-t-3xl bg-[#121516] px-6 pb-8 pt-6">
                {/* Modal Header */}
                <ThemedView className="mb-6 flex-row items-center justify-between">
                  <ThemedText className="text-xl font-bold text-white">Sign In</ThemedText>
                  <ThemedButton
                    variant="outline"
                    size="sm"
                    className="border-0 bg-transparent"
                    onPress={closeUsernameModal}>
                    <ThemedText className="text-lg text-[#a2adb3]">✕</ThemedText>
                  </ThemedButton>
                </ThemedView>

                {/* Form Inputs */}
                <ThemedView className="mb-6 gap-4" transparent>
                  <ThemedTextInput
                    placeholder="Username"
                    placeholderTextColor="#a2adb3"
                    value={username}
                    onChangeText={setUsername}
                    className="h-14 w-full rounded-xl border-0 bg-[#2c3135] p-4 text-base font-normal text-white"
                  />

                  <ThemedTextInput
                    placeholder="Password"
                    placeholderTextColor="#a2adb3"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="h-14 w-full rounded-xl border-0 bg-[#2c3135] p-4 text-base font-normal text-white"
                  />
                </ThemedView>

                {/* Forgot Password */}
                <ThemedButton
                  variant="outline"
                  size="sm"
                  className="mb-4 border-0 bg-transparent py-3">
                  <ThemedText className="text-sm font-normal text-[#a2adb3] underline">
                    Forgot password?
                  </ThemedText>
                </ThemedButton>

                {/* Sign In Button */}
                <ThemedButton
                  variant="primary"
                  size="md"
                  fullWidth
                  className="h-12 rounded-xl bg-[#b2d1e5]"
                  onPress={handleUsernamePasswordSignIn}>
                  <ThemedText className="text-base font-semibold text-[#121516]">
                    Sign In
                  </ThemedText>
                </ThemedButton>

                {/* Sign Up Link */}
                <ThemedButton
                  variant="outline"
                  size="sm"
                  className="mt-4 border-0 bg-transparent py-3">
                  <ThemedText className="text-center text-sm font-normal text-[#a2adb3] underline">
                    Don't have an account? Sign up
                  </ThemedText>
                </ThemedButton>
              </ThemedView>
            </KeyboardAvoidingView>
          </ThemedView>
        </Modal>
      </ThemedView>
    </Container>
  );
}
