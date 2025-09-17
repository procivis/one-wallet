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
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { config } from '../../config';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { useRegisterHolder } from '../onboarding/wallet-unit-attestation-screen';

const testID = 'WalletUnitAttestationScreen';
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

export const useCheckWalletUnitAttestation = () => {
  const queryClient = useQueryClient();
  const { core, organisationId } = useONECore();

  return useMutation(
    async () =>
      core.holderRefreshWalletUnit({
        appIntegrityCheckRequired:
          config.walletProvider.appIntegrityCheckRequired,
        organisationId,
      }),
    {
      onError: () =>
        queryClient.invalidateQueries([ATTESTATION_QUERY_KEY, organisationId]),
      onSuccess: () =>
        queryClient.invalidateQueries([ATTESTATION_QUERY_KEY, organisationId]),
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
  const { data: walletUnitAttestation, isLoading: isDetailsLoading } =
    useWalletUnitAttestation();
  const { mutateAsync: checkWalletUnitAttestation, isLoading: isCheckLoading } =
    useCheckWalletUnitAttestation();
  const { mutateAsync: registerHolder, isLoading: isRegisterLoading } =
    useRegisterHolder();

  const isCheckButtonEnabled =
    walletUnitAttestation?.status === undefined &&
    !isDetailsLoading &&
    !isCheckLoading &&
    !isRegisterLoading;

  const handleCheck = useCallback(() => {
    if (!walletUnitAttestation) {
      registerHolder();
    } else {
      checkWalletUnitAttestation();
    }
  }, [checkWalletUnitAttestation, registerHolder, walletUnitAttestation]);

  const status = getStatus(walletUnitAttestation?.status, colorScheme);
  const Icon = status.icon;

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <BackButton
            onPress={navigation.goBack}
            testID={concatTestID(testID, 'back')}
          />
        ),
        title: translate('common.walletUnitAttestation'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID={testID}
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
          disabled={!isCheckButtonEnabled}
          onPress={handleCheck}
          testID={concatTestID(testID, 'checkButton')}
          title={translate('common.check')}
          type={isCheckButtonEnabled ? ButtonType.Primary : ButtonType.Border}
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
