import { TextInput, TextInputProps } from 'react-native';

import { useTheme } from '../context/theme';

interface ThemedTextInputProps extends TextInputProps {
  className?: string;
}

export function ThemedTextInput({
  className = '',
  style,
  placeholderTextColor,
  ...props
}: ThemedTextInputProps) {
  const { isDarkMode } = useTheme();

  return (
    <TextInput
      className={`rounded-lg border p-3 ${
        isDarkMode
          ? 'border-neutral-700 bg-neutral-800 text-white'
          : 'border-neutral-300 bg-white text-black'
      } ${className}`}
      style={style}
      placeholderTextColor={placeholderTextColor ?? (isDarkMode ? '#64748b' : '#94a3b8')}
      {...props}
    />
  );
}
