import React, { memo } from 'react';
import { View, useWindowDimensions } from 'react-native';

// Large detailed silhouette asset (vector)
// Requires react-native-svg-transformer and metro config
// eslint-disable-next-line import/no-relative-packages
import MaleSilhouette from '../../assets/human/male.svg';

type MuscleDiagramProps = {
  selected: string[]; // muscle group names e.g., ["Chest", "Back", ...]
  // Optional: categories to infer muscle groups from. Can be a single category or a list.
  categories?: string | string[];
  width?: number | string;
  height?: number | string;
  selectedColor?: string;
  baseColor?: string;
  strokeColor?: string;
  // Optional: show detailed SVG silhouette as a subtle background
  showSilhouette?: boolean;
  silhouetteOpacity?: number; // 0..1
  // Optional: enable tap on regions to toggle a muscle group in parent
  onToggleMuscle?: (groupName: string) => void;
};

export const MuscleDiagram = memo(function MuscleDiagram({
  width,
  height,
}: Partial<MuscleDiagramProps>) {
  const { width: winW, height: winH } = useWindowDimensions();

  // Intrinsic size of the source SVG (from the file attributes)
  const SVG_W = 666;
  const SVG_H = 956;

  // Compute a scale that fits entirely within the current window
  const scale = Math.min(winW / SVG_W, winH / SVG_H);
  const fittedW = Math.floor(SVG_W * scale);
  const fittedH = Math.floor(SVG_H * scale);

  // Allow caller overrides, else use fitted sizes
  const renderW = width ?? fittedW;
  const renderH = height ?? fittedH;

  return (
    <View className="w-full flex-1 items-center justify-center">
      <MaleSilhouette
        width={renderW}
        height={renderH}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </View>
  );
});

export default MuscleDiagram;
