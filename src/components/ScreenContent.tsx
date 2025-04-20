import { Text, View } from 'react-native';

import { EditScreenInfo } from './EditScreenInfo';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    // Apply Tailwind classes directly to className
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">{title}</Text>
      {/* You might want to adjust styling for the separator */}
      <View className="my-7 h-[1px] w-4/5 bg-gray-200" /> 
      <EditScreenInfo path={path} />
      {children}
    </View>
  );
};

// Remove the separate styles object
// const styles = {
//   container: `items-center flex-1 justify-center text-red-500`, // Note: text-red-500 was here, moved to View if needed, but often text color is set on Text
//   separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
//   title: `text-xl font-bold`,
// };