import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, {
  ComponentType,
  FunctionComponent,
  ReactElement,
  useMemo,
} from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type WalletNoticeProps = {
  accessory?: ComponentType<any> | ReactElement;
  icon?: ComponentType<any> | ReactElement;
  style?: StyleProp<ViewStyle>;
  text: string;
};

const WalletNotice: FunctionComponent<WalletNoticeProps> = ({
  accessory,
  icon,
  style,
  text,
}) => {
  const colorScheme = useAppColorScheme();

  const iconView: React.ReactElement | undefined = useMemo(() => {
    if (!icon) {
      return undefined;
    }
    if (React.isValidElement(icon)) {
      return icon;
    } else {
      const IconComponent = icon as React.ComponentType<any>;
      return <IconComponent />;
    }
  }, [icon]);

  const accessoryView: React.ReactElement | undefined = useMemo(() => {
    if (!accessory) {
      return undefined;
    }
    if (React.isValidElement(accessory)) {
      return accessory;
    } else {
      const AccessoryComponent = accessory as React.ComponentType<any>;
      return <AccessoryComponent />;
    }
  }, [accessory]);

  return (
    <View style={[styles.noticeContainer, style]}>
      {iconView}
      <Typography color={colorScheme.white}>{text}</Typography>
      {accessoryView}
    </View>
  );
};

const styles = StyleSheet.create({
  noticeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
});

export default WalletNotice;
