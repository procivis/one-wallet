import {
  TouchableOpacity,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, {
  ComponentType,
  FunctionComponent,
  ReactElement,
  useMemo,
} from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { NextIcon } from '../icon/wallet-icon';
import SettingItem from './setting-item';

export type ButtonSettingProps = {
  accessory?: ComponentType<any> | ReactElement;
  icon?: ComponentType<any> | ReactElement;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title: string;
};

const ButtonSetting: FunctionComponent<ButtonSettingProps> = ({
  accessory,
  title,
  onPress,
  icon,
  style,
  testID,
}) => {
  const colorScheme = useAppColorScheme();

  const accessoryView: React.ReactElement | undefined = useMemo(() => {
    if (!accessory) {
      return (
        <View style={styles.arrow}>
          <NextIcon color={colorScheme.text} />
        </View>
      );
    }
    if (React.isValidElement(accessory)) {
      return accessory;
    } else {
      const AccessoryComponent = accessory as React.ComponentType<any>;
      return <AccessoryComponent />;
    }
  }, [accessory, colorScheme.text]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.container}
      testID={testID}
    >
      <SettingItem icon={icon} style={style} title={title}>
        {accessoryView}
      </SettingItem>
    </TouchableOpacity>
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
