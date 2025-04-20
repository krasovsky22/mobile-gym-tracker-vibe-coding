import { View } from 'react-native';

interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <View className="flex-1 bg-neutral-50">
      {children}
    </View>
  );
}
