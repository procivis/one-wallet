import { Switch } from '@procivis/one-react-native-components';
import React, { ComponentType, FunctionComponent, ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import SettingItem from './setting-item';

export type SwitchSettingProps = {
  disabled?: boolean;
  icon?: ComponentType<any> | ReactElement;
  onChange: (newValue: boolean) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title: string;
  value: boolean;
};

const SwitchSetting: FunctionComponent<SwitchSettingProps> = ({
  title,
  value,
  onChange,
  icon,
  style,
  disabled = false,
  testID,
}) => {
  return (
    <SettingItem icon={icon} style={style} title={title}>
      <Switch
        accessibilityLabel={title}
        disabled={disabled}
        onChange={onChange}
        testID={testID}
        value={value}
      />
    </SettingItem>
  );
};

export default SwitchSetting;
