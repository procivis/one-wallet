import {
  CloseIcon,
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, {
  ComponentType,
  FunctionComponent,
  ReactElement,
  useMemo,
} from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export type WalletNoticeProps = {
  accessory?: ComponentType<any> | ReactElement;
  icon?: ComponentType<any> | ReactElement;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  text: string;
};

const testID = 'WalletNotice';

const WalletNotice: FunctionComponent<WalletNoticeProps> = ({
  accessory,
  icon,
  style,
  text,
  onClose,
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
      <View style={styles.title}>
        {iconView}
        <Typography color={colorScheme.white}>{text}</Typography>
        {accessoryView}
      </View>
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeIcon}
          testID={concatTestID(testID, 'close')}
        >
          <CloseIcon color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  closeIcon: {
    position: 'absolute',
    right: 20,
    top: 5,
  },
  noticeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
});

export default WalletNotice;
