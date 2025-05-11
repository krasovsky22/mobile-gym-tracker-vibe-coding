import { ThemedView } from './ThemedView';

interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return <ThemedView className="flex-1 bg-neutral-50">{children}</ThemedView>;
}
