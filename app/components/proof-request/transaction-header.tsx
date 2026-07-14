import {
  CredentialLogo,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type TransactionHeaderProps = {
  accessory?: React.ComponentType<any> | React.ReactElement;
  logoInitials: string;
  style?: StyleProp<ViewStyle>;
  title: string;
};

const TransactionHeader: FC<TransactionHeaderProps> = ({
  accessory,
  logoInitials,
  style,
  title,
}) => {
  const colorScheme = useAppColorScheme();

  const accessoryView: React.ReactElement | undefined = useMemo(() => {
    if (!accessory) {
      return undefined;
    }
    if (React.isValidElement(accessory)) {
      return accessory;
    } else {
      const AccessoryComponent = accessory;
      return <AccessoryComponent />;
    }
  }, [accessory]);

  return (
    <View style={[styles.row, style]}>
      <CredentialLogo credentialName={logoInitials} />
      <Typography color={colorScheme.text} preset="m" style={styles.name}>
        {title}
      </Typography>
      {accessoryView}
    </View>
  );
};

const styles = StyleSheet.create({
  name: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
});

export default TransactionHeader;
