import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useBackupFinalizeImportProcedure } from '../../hooks/core/backup';
import { useCloseButtonTimeout } from '../../hooks/navigation/close-button-timeout';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const ProcessingScreen: FC = () => {
  const isFocused = useIsFocused();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const finalizeImport = useBackupFinalizeImportProcedure();
  const [state, setState] = useState(LoaderViewState.InProgress);

  useBlockOSBackNavigation();

  const handleBackupRestore = useCallback(async () => {
    try {
      await finalizeImport();
      setState(LoaderViewState.Success);
    } catch (e) {
      reportException(e, 'Backup restoring failure');
      setState(LoaderViewState.Warning);
    }
  }, [finalizeImport]);

  useEffect(() => {
    handleBackupRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeButtonHandler = useCallback(() => {
    // TODO: implement possible restoring termination
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success,
    closeButtonHandler,
  );

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
        leftItem: HeaderCloseModalButton,
        modalHandleVisible: Platform.OS === 'ios',
        title: translate('restoreBackup.processing.title'),
      }}
      loader={{
        animate: isFocused,
        label: translate(`restoreBackup.processing.${state}`),
        state,
      }}
      testID="RestoreBackupProcessingScreen"
    />
  );
};

export default ProcessingScreen;
