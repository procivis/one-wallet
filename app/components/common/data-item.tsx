import {
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { FC } from 'react';
import React, {
  ColorValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export const DataItem: FC<{
  attribute: string;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  value: string;
  valueColor?: ColorValue;
}> = ({ attribute, multiline, style, value, valueColor, testID }) => {
  const colorScheme = useAppColorScheme();

  return (
    <View
      style={[styles.dataItem, { borderColor: colorScheme.background }, style]}
      testID={testID}
    >
      <Typography
        color={colorScheme.textSecondary}
        size="sml"
        style={styles.dataItemLabel}
      >
        {attribute}
      </Typography>

      <Typography
        color={valueColor ?? colorScheme.text}
        ellipsizeMode="tail"
        numberOfLines={multiline ? 0 : 1}
        testID={concatTestID(testID, 'value')}
      >
        {value}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    borderBottomWidth: 1,
    marginTop: 12,
    paddingBottom: 6,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
});
