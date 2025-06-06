import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  reportException,
  useBackupFinalizeImportProcedure,
  useBeforeRemove,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
} from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { usePinCodeInitialized } from '../../hooks/pin-code/pin-code';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const ProcessingScreen: FC = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<RestoreBackupNavigationProp<'Processing'>>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const { walletStore } = useStores();
  const pinInitialized = usePinCodeInitialized();
  const finalizeImport = useBackupFinalizeImportProcedure({
    generateHwKey: true,
    generateSwKey: true,
  });
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const [error, setError] = useState<unknown>();
  const dismissed = useRef(false);

  useBlockOSBackNavigation();

  const handleBackupRestore = useCallback(async () => {
    try {
      await finalizeImport().then(([hwDidId, swDidId]) => {
        walletStore.walletSetup(hwDidId, swDidId!);
      });
      setState(LoaderViewState.Success);
    } catch (e) {
      reportException(e, 'Backup restoring failure');
      setState(LoaderViewState.Warning);
      setError(e);
    }
  }, [finalizeImport, walletStore]);

  useEffect(() => {
    handleBackupRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeButtonHandler = useCallback(() => {
    if (dismissed.current === true) {
      return;
    }
    dismissed.current = true;
    if (state === LoaderViewState.Warning) {
      navigation.navigate('RestoreBackupDashboard');
    } else if (pinInitialized) {
      rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
    } else {
      rootNavigation.replace('Onboarding', { screen: 'UserAgreement' });
    }
  }, [pinInitialized, navigation, rootNavigation, state]);
  useBeforeRemove(closeButtonHandler);

  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success,
    closeButtonHandler,
  );

  const infoPressHandler = useCallback(() => {
    if (!error) {
      return;
    }
    rootNavigation.navigate('NerdMode', {
      params: { error },
      screen: 'ErrorNerdMode',
    });
  }, [error, rootNavigation]);

  return (
    <LoadingResultScreen
      button={
        state === LoaderViewState.Success
          ? {
              onPress: closeButtonHandler,
              testID: 'CredentialAcceptProcessScreen.close',
              title: translate('common.closeWithTimeout', {
                timeout: closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      header={{
        leftItem: (
          <HeaderCloseModalButton
            onPress={closeButtonHandler}
            testID="RestoreBackupProcessingScreen.header.close"
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID="RestoreBackupProcessingScreen.header.info"
            />
          ) : undefined,
        title: translate('restoreBackup.processing.title'),
      }}
      loader={{
        animate: isFocused,
        label: translateError(
          error,
          translate(`restoreBackup.processing.${state}`),
        ),
        state,
        testID: 'RestoreBackupProcessingScreen.animation',
      }}
      testID="RestoreBackupProcessingScreen"
    />
  );
};

export default ProcessingScreen;
