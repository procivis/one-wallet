import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { OneError } from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { useBackupFinalizeImportProcedure } from '../../hooks/core/backup';
import { useCloseButtonTimeout } from '../../hooks/navigation/close-button-timeout';
import { usePinCodeInitialized } from '../../hooks/pin-code/pin-code';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const ProcessingScreen: FC = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<RestoreBackupNavigationProp<'Processing'>>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const pinInitialized = usePinCodeInitialized();
  const finalizeImport = useBackupFinalizeImportProcedure();
  const [state, setState] = useState(LoaderViewState.InProgress);
  const [error, setError] = useState<OneError>();

  useBlockOSBackNavigation();

  const handleBackupRestore = useCallback(async () => {
    try {
      await finalizeImport();
      setState(LoaderViewState.Success);
    } catch (e) {
      reportException(e, 'Backup restoring failure');
      setState(LoaderViewState.Warning);
      setError(e as unknown as OneError);
    }
  }, [finalizeImport]);

  useEffect(() => {
    handleBackupRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeButtonHandler = useCallback(() => {
    // TODO: implement possible restoring termination
    if (pinInitialized) {
      rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
    } else if (state === LoaderViewState.Success) {
      rootNavigation.replace('Onboarding', { screen: 'UserAgreement' });
    } else {
      navigation.navigate('RestoreBackupDashboard');
    }
  }, [pinInitialized, navigation, rootNavigation, state]);

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
        leftItem: <HeaderCloseModalButton onPress={closeButtonHandler} />,
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton onPress={infoPressHandler} />
          ) : undefined,
        title: translate('restoreBackup.processing.title'),
      }}
      loader={{
        animate: isFocused,
        label: translate(`restoreBackup.processing.${state}`),
        state,
        testID: 'RestoreBackupProcessingScreen.animation',
      }}
      testID="RestoreBackupProcessingScreen"
    />
  );
};

export default ProcessingScreen;
