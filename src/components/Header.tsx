import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from '~/theme';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <SafeAreaView edges={['top']}>
      <ThemedView className="flex-row items-center px-4 py-2 shadow-sm">
        <TouchableOpacity className="mr-4 rounded-full" onPress={() => router.back()}>
          <ChevronLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <ThemedText className="text-xl font-semibold">{title}</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
