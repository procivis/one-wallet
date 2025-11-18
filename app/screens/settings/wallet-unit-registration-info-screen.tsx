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
  useWalletUnitDetail,
} from '@procivis/one-react-native-components';
import {
  HolderWalletUnitDetail,
  WalletUnitStatus,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const testID = 'WalletUnitRegistrationScreen';

const getStatus = (
  walletUnitDetail: HolderWalletUnitDetail | undefined,
  colorScheme: ColorScheme,
) => {
  if (walletUnitDetail?.status === WalletUnitStatus.REVOKED) {
    return {
      backgroundColor: 'rgba(217, 13, 13, 0.05)',
      icon: StatusErrorIcon,
      text: translate('common.revoked'),
      textColor: colorScheme.error,
    };
  }

  if (walletUnitDetail?.status === WalletUnitStatus.ACTIVE) {
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

const WalletUnitRegistrationInfoScreen: FC = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'AppInformation'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();
  const {
    walletStore: { registeredWalletUnitId },
  } = useStores();
  const { data: walletUnitDetail, isLoading } = useWalletUnitDetail(
    registeredWalletUnitId,
  );

  const isCheckButtonEnabled =
    walletUnitDetail?.status === undefined || !isLoading;

  const handleCheck = useCallback(() => {
    rootNavigation.navigate('WalletUnitRegistration', {
      operation: walletUnitDetail ? 'refresh' : 'register',
    });
  }, [rootNavigation, walletUnitDetail]);

  const status = useMemo(
    () => getStatus(walletUnitDetail, colorScheme),
    [colorScheme, walletUnitDetail],
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
        title: translate('common.walletUnitRegistration'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID={testID}
    >
      <View style={styles.contentContainer}>
        <Typography color={colorScheme.text} style={styles.contentDescription}>
          {translate('info.walletUnitRegistration.description')}
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
            testID={concatTestID(testID, 'id', walletUnitDetail?.id)}
          >
            <Icon
              testID={concatTestID(testID, 'icon', walletUnitDetail?.status)}
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
              walletUnitDetail
                ? translate('common.update')
                : translate('common.register')
            }
            type={isCheckButtonEnabled ? ButtonType.Primary : ButtonType.Border}
          />
        )}
      </View>
    </ScrollViewScreen>
  );
});

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

export default memo(WalletUnitRegistrationInfoScreen);
