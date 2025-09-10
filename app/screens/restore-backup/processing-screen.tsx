import {
  LoaderViewState,
  reportException,
  useBackupFinalizeImportProcedure,
  useBeforeRemove,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { usePinCodeInitialized } from '../../hooks/pin-code/pin-code';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const ProcessingScreen: FC = () => {
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

  return (
    <ProcessingView
      error={error}
      loaderLabel={translateError(
        error,
        translate(`restoreBackupProcessing.${state}`),
      )}
      onClose={closeButtonHandler}
      state={state}
      testID="RestoreBackupProcessingScreen"
      title={translate('common.restoreWalletBackup')}
    />
  );
};

export default ProcessingScreen;
