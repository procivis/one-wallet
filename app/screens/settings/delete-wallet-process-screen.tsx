import {
  LoaderViewState,
  reportException,
  reportTraceInfo,
  useBlockOSBackNavigation,
  useONECore,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';

import { ProcessingView } from '../../components/common/processing-view';
import { removePin } from '../../hooks/pin-code/pin-code';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const DeleteWalletProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Dashboard'>>();
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const { core, initialize } = useONECore();
  const queryClient = useQueryClient();
  const [error, setError] = useState<unknown>();

  const { walletStore } = useStores();

  const handleDeleteWallet = useCallback(async () => {
    reportTraceInfo('Wallet', 'Deleting wallet');

    try {
      await core.uninitialize(true);
    } catch (e) {
      reportException(e, 'Failed to uninitialize core');
      setState(LoaderViewState.Warning);
      setError(e);
    }

    await initialize(true);

    try {
      await removePin();
    } catch (e) {
      reportException(e, 'Failed to remove PIN');
      setState(LoaderViewState.Warning);
      setError(e);
    }

    await queryClient.resetQueries();
    walletStore.walletDeleted();
    setState(LoaderViewState.Success);
  }, [core, initialize, queryClient, walletStore]);

  useBlockOSBackNavigation();

  useEffect(() => {
    handleDeleteWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeButtonHandler = useCallback(() => {
    resetNavigationAction(rootNavigation, [{ name: 'Onboarding' }]);
  }, [rootNavigation]);

  return (
    <ProcessingView
      error={error}
      loaderLabel={translateError(
        error,
        translate(`deleteWalletProcessTitle.${state}`),
      )}
      onClose={closeButtonHandler}
      state={state}
      testID="DeleteWalletProcessScreen"
      title={translate('common.walletDeletion')}
    />
  );
};

export default DeleteWalletProcessScreen;
