import { View, ViewProps } from 'react-native';

import { useTheme } from '../context/theme';

type ThemedViewProps = ViewProps & {
  className?: string;
};

export function ThemedView({ className = '', style, ...props }: ThemedViewProps) {
  const { isDarkMode } = useTheme();

  return (
    <View
      className={`${className} ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}
      style={style}
      {...props}
    />
  );
}
