import React, { FunctionComponent } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import RNBlurOverlay from 'react-native-blur-overlay';

export enum BlurStyle {
  Light = 'light',
  ExtraLight = 'extraLight',
  Dark = 'dark',
}
interface BlurOverlayProps {
  style: StyleProp<ViewStyle>;
  blurStyle: BlurStyle;
}

const BlurOverlay: FunctionComponent<BlurOverlayProps> = ({ style, blurStyle }) => {
  const brightness = blurStyle === BlurStyle.Dark ? -180 : blurStyle === BlurStyle.ExtraLight ? 20 : 0;
  return (
    <View style={style}>
      <RNBlurOverlay
        ref={(overlay: any) => overlay?.openOverlay()}
        customStyles={styles.overlay}
        blurStyle={blurStyle}
        brightness={brightness}
        radius={34}
        downsampling={50}
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
