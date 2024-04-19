import {
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { FC, ReactNode } from 'react';
import React, { ColorValue, StyleSheet, View, ViewProps } from 'react-native';

export interface DataItemProps extends ViewProps {
  attribute: string;
  last?: boolean;
  multiline?: boolean;
  value: string;
  valueColor?: ColorValue;
  valueIcon?: ReactNode;
}

export const DataItem: FC<DataItemProps> = ({
  attribute,
  value,
  valueColor,
  valueIcon,
  multiline,
  last,
  testID,
  style,
  ...props
}) => {
  const colorScheme = useAppColorScheme();

  return (
    <View
      style={[
        styles.dataItem,
        { borderColor: colorScheme.background },
        last && styles.last,
        style,
      ]}
      testID={testID}
      {...props}
    >
      <Typography
        color={colorScheme.text}
        preset="xs/line-height-small"
        style={styles.dataItemLabel}
        testID={concatTestID(testID, 'title')}
      >
        {attribute}
      </Typography>

      <View style={styles.value}>
        {valueIcon}
        <Typography
          color={valueColor ?? colorScheme.text}
          numberOfLines={multiline ? undefined : 1}
          preset="s"
          style={valueIcon ? styles.valueLabel : undefined}
          testID={concatTestID(testID, 'value')}
        >
          {value}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  dataItemLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  last: {
    borderBottomWidth: 0,
  },
  value: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  valueLabel: {
    marginLeft: 4,
  },
});
