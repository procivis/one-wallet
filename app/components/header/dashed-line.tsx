import { useAppColorScheme } from '@procivis/react-native-components';
import React, { useState } from 'react';
import { LayoutRectangle, Platform, StyleProp, StyleSheet, View, ViewProps } from 'react-native';
import Svg, { Color, Path } from 'react-native-svg';

interface Props {
  style?: StyleProp<ViewProps>;
  color?: Color;
}

// dashed/dotted border not properly supported on iOS, workaround using SVG Path component
export const DashedLine: React.FunctionComponent<Props> = ({ style, color }) => {
  const colorScheme = useAppColorScheme();
  const [layout, setLayout] = useState<LayoutRectangle>();
  const width = Math.floor(layout?.width || 0);
  return (
    <View style={[styles.container, style]} onLayout={(e) => setLayout(e.nativeEvent.layout)}>
      {layout ? (
        <Svg width={width} height={1} viewBox={`0 0 ${width} 1`} fill="none">
          <Path
            d={`M0.5 0.5 H${width} Z`}
            stroke={color ?? colorScheme.lighterGrey}
            strokeWidth={1}
            strokeDasharray={[0, 3, Platform.OS === 'ios' ? 3 : 2]}
          />
        </Svg>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 1,
    width: '100%',
  },
});
