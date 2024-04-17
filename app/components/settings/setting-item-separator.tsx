import { useAppColorScheme } from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import {
  ColorValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type SettingItemSeparatorProps = {
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

const SettingItemSeparator: FC<SettingItemSeparatorProps> = ({
  color,
  style,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[styles.wrapper, { backgroundColor: colorScheme.white }, style]}
    >
      <View
        style={[
          styles.separator,
          { backgroundColor: color ?? colorScheme.background },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  separator: {
    height: '100%',
    width: '100%',
  },
  wrapper: {
    height: 1,
    marginHorizontal: 16,
    paddingHorizontal: 12,
  },
});

export default SettingItemSeparator;
