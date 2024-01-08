import React, { FunctionComponent, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import RNBlurOverlay from 'react-native-blur-overlay';

export enum BlurStyle {
  Dark = 'dark',
  ExtraLight = 'extraLight',
  Light = 'light',
}
interface BlurOverlayProps {
  blurStyle: BlurStyle;
  style: StyleProp<ViewStyle>;
}

const BlurOverlay: FunctionComponent<BlurOverlayProps> = ({
  style,
  blurStyle,
}) => {
  const brightness = useMemo(() => {
    switch (blurStyle) {
      case BlurStyle.Dark:
        return -180;
      case BlurStyle.ExtraLight:
        return 20;
      case BlurStyle.Light:
      default:
        return 0;
    }
  }, [blurStyle]);

  return (
    <View style={style}>
      <RNBlurOverlay
        blurStyle={blurStyle}
        brightness={brightness}
        customStyles={styles.overlay}
        downsampling={50}
        radius={34}
        ref={(overlay: any) => overlay?.openOverlay()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
});

export default BlurOverlay;
