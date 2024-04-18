import {
  TouchableHighlight,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { ComponentType, FunctionComponent, ReactElement } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { NextIcon } from '../icon/wallet-icon';
import SettingItem from './setting-item';

export type ButtonSettingProps = {
  icon?: ComponentType<any> | ReactElement;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title: string;
};

const ButtonSetting: FunctionComponent<ButtonSettingProps> = ({
  title,
  onPress,
  icon,
  style,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <TouchableHighlight
      accessibilityRole="button"
      onPress={onPress}
      style={styles.container}
      testID={testID}
      underlayColor={colorScheme.background}
    >
      <SettingItem icon={icon} style={style} title={title}>
        <View style={styles.arrow}>
          <NextIcon color={colorScheme.text} />
        </View>
      </SettingItem>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  arrow: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  container: {
    width: '100%',
  },
});

export default ButtonSetting;
