import { useAppColorScheme } from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import ButtonSetting, { ButtonSettingProps } from './button-setting';

type SettingsButtonProps = ButtonSettingProps;

const SettingsButton: FC<SettingsButtonProps> = ({ style, ...props }) => {
  const colorScheme = useAppColorScheme();
  return (
    <ButtonSetting
      style={[
        styles.button,
        { backgroundColor: colorScheme.background },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    height: 68,
    marginHorizontal: 0,
    paddingHorizontal: 12,
  },
});

export default SettingsButton;
