import React, { useState } from 'react';
import { LayoutRectangle, View, ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';

/**
 * Resizes an SVG image to fit into the target ViewProps, keeping the original aspect ratio
 * @param SvgComponent The original SVG component
 * @param svgProportions The original SVG size
 * @returns HOC View component wrapping the original SVG image
 */
export function svgResizer(
  SvgComponent: React.ComponentType<SvgProps>,
  svgProportions: { width: number; height: number },
) {
  const SvgResizer: React.FunctionComponent<ViewProps> = (props) => {
    const [layout, setLayout] = useState<LayoutRectangle>();
    const scaleRatio = layout
      ? Math.min(layout.width / svgProportions.width, layout.height / svgProportions.height)
      : undefined;
    return (
      <View {...props} onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        {scaleRatio ? (
          <SvgComponent width={svgProportions.width * scaleRatio} height={svgProportions.height * scaleRatio} />
        ) : null}
      </View>
    );
  };
  return SvgResizer;
}
