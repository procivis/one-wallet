import {
  BackButton,
  Button,
  ButtonType,
  ColorScheme,
  concatTestID,
  ScrollViewScreen,
  StatusErrorIcon,
  StatusSuccessIcon,
  StatusWarningIcon,
  Typography,
  useAppColorScheme,
  useONECore,
} from '@procivis/one-react-native-components';
import { WalletUnitStatusEnum } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from 'react-query';

import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const testID = 'WalletUnitAttestation';
export const ATTESTATION_QUERY_KEY = 'wallet-unit-attestation';

export const useWalletUnitAttestation = (active = true) => {
  const { core, organisationId } = useONECore();

  return useQuery(
    [ATTESTATION_QUERY_KEY, organisationId],
    () => core.holderGetWalletUnitAttestation(organisationId),
    {
      enabled: active,
      keepPreviousData: true,
    },
  );
};

const getStatus = (
  status: WalletUnitStatusEnum | undefined,
  colorScheme: ColorScheme,
) => {
  if (status === WalletUnitStatusEnum.REVOKED) {
    return {
      backgroundColor: 'rgba(217, 13, 13, 0.05)',
      icon: StatusErrorIcon,
      text: translate('common.revoked'),
      textColor: colorScheme.error,
    };
  }

  if (status === WalletUnitStatusEnum.ACTIVE) {
    return {
      backgroundColor: colorScheme.background,
      icon: StatusSuccessIcon,
      text: translate('common.accepted'),
      textColor: colorScheme.text,
    };
  }

  return {
    backgroundColor: colorScheme.background,
    icon: StatusWarningIcon,
    text: translate('common.none'),
    textColor: colorScheme.text,
  };
};

const WalletUnitAttestationScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'AppInformation'>>();
  const {
    data: walletUnitAttestation,
    isLoading,
    refetch,
  } = useWalletUnitAttestation();
  const isCheckEnabled = walletUnitAttestation?.status === undefined;

  const handleCheck = useCallback(() => {
    refetch();
  }, [refetch]);

  const status = getStatus(walletUnitAttestation?.status, colorScheme);
  const Icon = status.icon;

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <BackButton
            onPress={navigation.goBack}
            testID="WalletUnitAttestationScreen.back"
          />
        ),
        title: translate('common.walletUnitAttestation'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID="WalletUnitAttestationScreen"
    >
      <View style={styles.contentContainer}>
        <Typography color={colorScheme.text} style={styles.contentDescription}>
          {translate('info.walletUnitAttestation.description')}
        </Typography>
        <View
          style={[
            styles.statusWrapper,
            { backgroundColor: status.backgroundColor },
          ]}
        >
          <Icon />
          <Typography color={colorScheme.text} style={styles.status}>
            {translate('common.status')}
          </Typography>
          <Typography color={status.textColor} style={styles.statusText}>
            {status.text}
          </Typography>
        </View>
      </View>
      <View style={styles.button}>
        <Button
          disabled={!isCheckEnabled || isLoading}
          onPress={handleCheck}
          testID={concatTestID(testID, 'checkButton')}
          title={translate('common.check')}
          type={isCheckEnabled ? ButtonType.Primary : ButtonType.Border}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: 12,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentDescription: {
    marginBottom: 24,
    opacity: 0.7,
  },
  status: {
    flex: 1,
    marginLeft: 6,
    opacity: 0.7,
    paddingVertical: 12,
  },
  statusText: {
    paddingHorizontal: 6,
  },
  statusWrapper: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});

export default memo(WalletUnitAttestationScreen);
