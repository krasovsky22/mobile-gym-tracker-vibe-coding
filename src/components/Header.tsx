import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <View className="flex-row items-center bg-white px-4 py-2 shadow-sm">
        <TouchableOpacity className="mr-4 rounded-full" onPress={() => router.back()}>
          <ChevronLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-neutral-900">{title}</Text>
      </View>
    </SafeAreaView>
  );
}
