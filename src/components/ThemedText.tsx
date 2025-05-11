import { Text, TextProps } from 'react-native';

import { useTheme } from '../context/theme';

type ThemedTextProps = TextProps & {
  className?: string;
};

export function ThemedText({ className = '', style, ...props }: ThemedTextProps) {
  const { isDarkMode } = useTheme();

  return (
    <Text
      className={`${className} ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
      style={style}
      {...props}
    />
  );
}
