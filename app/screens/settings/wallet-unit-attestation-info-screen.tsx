import {
  BackButton,
  Button,
  ButtonType,
  ColorScheme,
  concatTestID,
  LoaderView,
  LoaderViewState,
  ScrollViewScreen,
  StatusErrorIcon,
  StatusSuccessIcon,
  StatusWarningIcon,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  HolderAttestationWalletUnitResponse,
  WalletUnitStatusEnum,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useWalletUnitAttestation } from '../../hooks/wallet-unit';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { isWalletAttestationExpired } from '../../utils/wallet-unit';

const testID = 'WalletUnitAttestationScreen';

const getStatus = (
  walletUnitAttestation: HolderAttestationWalletUnitResponse | undefined,
  colorScheme: ColorScheme,
) => {
  if (walletUnitAttestation?.status === WalletUnitStatusEnum.REVOKED) {
    return {
      backgroundColor: 'rgba(217, 13, 13, 0.05)',
      icon: StatusErrorIcon,
      text: translate('common.revoked'),
      textColor: colorScheme.error,
    };
  }

  if (isWalletAttestationExpired(walletUnitAttestation)) {
    return {
      backgroundColor: colorScheme.background,
      icon: StatusWarningIcon,
      text: translate('common.expired'),
      textColor: colorScheme.text,
    };
  }

  if (walletUnitAttestation?.status === WalletUnitStatusEnum.ACTIVE) {
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

const WalletUnitAttestationInfoScreen: FC = () => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'AppInformation'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();
  const { data: walletUnitAttestation, isLoading } =
    useWalletUnitAttestation(isFocused);

  const isCheckButtonEnabled =
    (walletUnitAttestation?.status === undefined ||
      isWalletAttestationExpired(walletUnitAttestation)) &&
    !isLoading;

  const handleCheck = useCallback(() => {
    rootNavigation.navigate(
      'WalletUnitAttestation',
      walletUnitAttestation ? { refresh: true } : { register: true },
    );
  }, [rootNavigation, walletUnitAttestation]);

  const status = useMemo(
    () => getStatus(walletUnitAttestation, colorScheme),
    [colorScheme, walletUnitAttestation],
  );
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
        {isLoading && (
          <View style={styles.loaderWrapper}>
            <LoaderView animate={true} state={LoaderViewState.InProgress} />
          </View>
        )}
        {!isLoading && (
          <View
            style={[
              styles.statusWrapper,
              { backgroundColor: status.backgroundColor },
            ]}
          >
            <Icon
              testID={concatTestID(
                testID,
                'icon',
                walletUnitAttestation?.status,
              )}
            />
            <Typography color={colorScheme.text} style={styles.status}>
              {translate('common.status')}
            </Typography>
            <Typography
              color={status.textColor}
              style={styles.statusText}
              testID={concatTestID(testID, 'status')}
            >
              {status.text}
            </Typography>
          </View>
        )}
      </View>
      <View style={styles.button}>
        {!isLoading && (
          <Button
            disabled={!isCheckButtonEnabled}
            onPress={handleCheck}
            testID={concatTestID(testID, 'checkButton')}
            title={
              walletUnitAttestation
                ? translate('common.update')
                : translate('common.register')
            }
            type={isCheckButtonEnabled ? ButtonType.Primary : ButtonType.Border}
          />
        )}
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
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
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

export default memo(WalletUnitAttestationInfoScreen);
