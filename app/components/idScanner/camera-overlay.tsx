import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const IDScannerOverlay: React.FunctionComponent<ViewProps> = () => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.container}>
      <View style={[styles.padding, { backgroundColor: colorScheme.overlay }]} />
      <Svg width={375} height={224} viewBox="0 294 375 224" fill="none">
        <Path
          fillRule="evenodd"
          d="M593 0h-812v812h812V0ZM46 295c-6.627 0-12 5.373-12 12v198c0 6.627 5.373 12 12 12h282c6.627 0 12-5.373 12-12V307c0-6.627-5.373-12-12-12H46Z"
          fill={colorScheme.overlay}
        />
        <Rect x={34} y={295} width={306} height={222} rx={12} stroke={colorScheme.white} strokeWidth={2} />
      </Svg>
      <View style={[styles.padding, { backgroundColor: colorScheme.overlay }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
  padding: {
    flex: 1,
  },
});

export default IDScannerOverlay;
