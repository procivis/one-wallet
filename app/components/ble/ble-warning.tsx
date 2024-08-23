import {
  CredentialWarningIcon,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { PermissionStatus, RESULTS } from 'react-native-permissions';

import { translate } from '../../i18n';

type PermissionOrDisabled = PermissionStatus | 'disabled';

type BleWarningProps = {
  status: PermissionOrDisabled;
};

const warningMessages = {
  [RESULTS.DENIED]: translate('common.ble.missingPermissions'),
  [RESULTS.BLOCKED]: translate('common.ble.missingPermissions'),
  [RESULTS.UNAVAILABLE]: translate('common.ble.noSupport'),
  disabled: translate('common.ble.adapterDisabled'),
} as {
  [K in PermissionOrDisabled]: string;
};

const BleWarning: FunctionComponent<BleWarningProps> = ({ status }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[
        styles.warningMessageWrapper,
        { backgroundColor: colorScheme.background },
      ]}
    >
      <CredentialWarningIcon height={42} width={42} />
      <Typography
        color={colorScheme.text}
        preset="regular"
        style={styles.warningMessageText}
      >
        {warningMessages[status]}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  warningMessageText: {
    marginHorizontal: 50,
    textAlign: 'center',
  },
  warningMessageWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
});

export default BleWarning;
