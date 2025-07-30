import { View, ViewProps, ViewStyle } from 'react-native';

import { useTheme } from '../context/theme';

type ThemedViewProps = ViewProps & {
  className?: string;
  transparent?: boolean;
  style?: ViewStyle;
};

export function ThemedView({
  className = '',
  transparent = false,
  style = {},
  ...props
}: ThemedViewProps) {
  const { isDarkMode } = useTheme();

  let additionalStyles: ViewStyle = {};

  if (transparent) {
    additionalStyles = { backgroundColor: 'transparent' };
  }

  return (
    <View
      className={`${isDarkMode ? 'bg-neutral-900' : 'bg-white'} ${className}`}
      style={[style, additionalStyles]}
      {...props}
    />
  );
}
