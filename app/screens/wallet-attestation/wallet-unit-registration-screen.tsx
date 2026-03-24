import {
  ButtonType,
  concatTestID,
  LoaderViewState,
  Transport,
  useAvailableTransports,
  useRegisterWalletUnit,
  useWalletUnitStatus,
} from '@procivis/one-react-native-components';
import { WalletUnitStatus } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { config } from '../../config';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const testID = 'WalletUnitRegistrationScreen';

const WalletUnitRegistrationScreen = () => {
  const [error, setError] = useState<unknown>();
  const [status, setStatus] = useState<LoaderViewState>(
    LoaderViewState.InProgress,
  );
  const [walletUnitStatus, setWalletUnitStatus] = useState<WalletUnitStatus>();
  const {
    walletStore,
    walletStore: { walletProvider, walletUnitId },
  } = useStores();
  const { availableTransport } = useAvailableTransports([Transport.HTTP]);
  const hasInternetConnection = availableTransport?.includes(Transport.HTTP);
  const handled = useRef<boolean>(false);

  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const route = useRoute<RootRouteProp<'WalletUnitRegistration'>>();
  const { mutateAsync: registerWalletUnit, isSuccess: registeredNewWallet } =
    useRegisterWalletUnit();
  const { mutateAsync: refreshWalletUnit } = useWalletUnitStatus();

  const closeHandler = useCallback(() => {
    const resetToDashboard = route.params?.resetToDashboard;
    const errorStatuses = [LoaderViewState.Error, LoaderViewState.Warning];
    if (
      resetToDashboard === true ||
      (resetToDashboard === 'onError' && errorStatuses.includes(status))
    ) {
      resetNavigationAction(rootNavigation, [
        { name: 'Dashboard', params: { screen: 'Wallet' } },
      ]);
    } else {
      rootNavigation.goBack();
    }
  }, [rootNavigation, route.params?.resetToDashboard, status]);

  const handleRegisterOrRefresh = useCallback(async () => {
    if (hasInternetConnection === undefined || handled.current) {
      return;
    }
    handled.current = true;
    if (!hasInternetConnection) {
      setStatus(LoaderViewState.Warning);
      return;
    }
    try {
      setStatus(LoaderViewState.InProgress);
      if (route.params.operation === 'refresh') {
        await refreshWalletUnit(walletUnitId);
      } else {
        if (!config.walletProvider) {
          throw new Error('No wallet provider specified');
        }

        const walletUnit = await registerWalletUnit({
          type: config.walletProvider.type,
          url: `${config.walletProvider.url}/ssi/wallet-provider/v1/${config.walletProvider.type}`,
        });
        walletStore.walletUnitIdSetup(walletUnit.id);
        setWalletUnitStatus(walletUnit.status);
        if (walletUnit.status === WalletUnitStatus.UNATTESTED) {
          if (
            walletProvider.walletUnitAttestation.required ||
            route.params.attestationRequired
          ) {
            setStatus(LoaderViewState.Error);
          } else {
            setStatus(LoaderViewState.Warning);
          }
        }
      }
      setStatus(LoaderViewState.Success);
      closeHandler();
    } catch (err) {
      if (
        walletProvider.walletUnitAttestation.required ||
        route.params.attestationRequired
      ) {
        setStatus(LoaderViewState.Error);
      } else {
        setStatus(LoaderViewState.Warning);
      }
      setError(err);
    }
  }, [
    closeHandler,
    hasInternetConnection,
    refreshWalletUnit,
    registerWalletUnit,
    route.params.attestationRequired,
    route.params.operation,
    walletProvider.walletUnitAttestation.required,
    walletStore,
    walletUnitId,
  ]);

  useEffect(() => {
    handleRegisterOrRefresh();
  }, [handleRegisterOrRefresh]);

  const handleRetry = useCallback(() => {
    handled.current = false;
    handleRegisterOrRefresh();
  }, [handleRegisterOrRefresh]);

  const loaderLabel = useMemo(() => {
    if (status === LoaderViewState.InProgress) {
      return translate('walletUnitRegistration.inProgress');
    }
    if (status === LoaderViewState.Success) {
      if (registeredNewWallet) {
        return translate('walletUnitRegistration.ready');
      } else {
        return translate('walletUnitRegistration.updated');
      }
    }
    if (!error) {
      if (route.params.operation === 'refresh') {
        return translate('walletUnitRegistration.noInternet.refresh');
      } else {
        return translate('walletUnitRegistration.noInternet.register');
      }
    }
    return translateError(error, translate('walletUnitRegistration.error'));
  }, [error, registeredNewWallet, status, route.params.operation]);

  const retryButton = useMemo(
    () => ({
      onPress: handleRetry,
      testID: concatTestID(testID, 'retry'),
      title: translate('common.retry'),
    }),
    [handleRetry],
  );

  const closeButton = useMemo(
    () => ({
      onPress: closeHandler,
      testID: concatTestID(testID, 'close'),
      title: translate('common.close'),
      type: ButtonType.Secondary,
    }),
    [closeHandler],
  );

  const button = useMemo(() => {
    switch (walletUnitStatus) {
      case WalletUnitStatus.ERROR:
        return retryButton;
      case WalletUnitStatus.UNATTESTED:
        return !walletProvider.walletUnitAttestation.required
          ? closeButton
          : undefined;
      default:
        return closeButton;
    }
  }, [
    closeButton,
    retryButton,
    walletProvider.walletUnitAttestation.required,
    walletUnitStatus,
  ]);

  const secondaryButton =
    walletUnitStatus === WalletUnitStatus.ERROR &&
    !walletProvider.walletUnitAttestation.required
      ? {
          onPress: closeHandler,
          testID: concatTestID(testID, 'close'),
          title: translate('common.close'),
          type: ButtonType.Secondary,
        }
      : undefined;

  return (
    <ProcessingView
      button={button}
      error={error}
      loaderLabel={loaderLabel}
      onClose={
        walletProvider.walletUnitAttestation.required ? undefined : closeHandler
      }
      secondaryButton={secondaryButton}
      state={status}
      testID={testID}
      title={translate('common.walletRegistration')}
    />
  );
};

export default memo(WalletUnitRegistrationScreen);
