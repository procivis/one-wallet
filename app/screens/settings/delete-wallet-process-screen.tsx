import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  reportException,
  reportTraceInfo,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useONECore,
} from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { removePin } from '../../hooks/pin-code/pin-code';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const DeleteWalletProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Dashboard'>>();
  const isFocused = useIsFocused();
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
              testID: 'DeleteWalletProcessScreen.close',
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
            testID="DeleteWalletProcessScreen.header.close"
          />
        ),
        rightItem:
          state === LoaderViewState.Warning && error ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID="DeleteWalletProcessScreen.header.info"
            />
          ) : undefined,
        title: translate('deleteWalletProcess.title'),
      }}
      loader={{
        animate: isFocused,
        label: translateError(
          error,
          translate(`deleteWalletProcess.${state}.title`),
        ),
        state,
        testID: 'DeleteWalletProcessScreen.animation',
      }}
      testID="DeleteWalletProcessScreen"
    />
  );
};

export default DeleteWalletProcessScreen;
