import {
  ButtonType,
  concatTestID,
  LoaderViewState,
  Transport,
  useAvailableTransports,
  useRefreshWalletUnit,
  useRegisterWalletUnit,
} from '@procivis/one-react-native-components';
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
import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const testID = 'WalletUnitAttestationScreen';

const WalletUnitAttestationScreen = () => {
  const [error, setError] = useState<unknown>();
  const [status, setStatus] = useState<LoaderViewState>(
    LoaderViewState.InProgress,
  );
  const { availableTransport } = useAvailableTransports([Transport.HTTP]);
  const hasInternetConnection = availableTransport?.includes(Transport.HTTP);
  const handled = useRef<boolean>(false);

  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const route = useRoute<RootRouteProp<'WalletUnitAttestation'>>();
  const { mutateAsync: registerWalletUnit, isSuccess: registeredNewWallet } =
    useRegisterWalletUnit();
  const { mutateAsync: refreshWalletUnit } = useRefreshWalletUnit();

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
      if (route.params.refresh) {
        await refreshWalletUnit(
          config.walletProvider.appIntegrityCheckRequired,
        );
      } else {
        await registerWalletUnit(config.walletProvider);
      }
      setStatus(LoaderViewState.Success);
      closeHandler();
    } catch (err) {
      if (config.walletProvider.required || route.params.attestationRequired) {
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
    route.params,
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
      return translate('walletUnitAttestation.inProgress');
    }
    if (status === LoaderViewState.Success) {
      if (registeredNewWallet) {
        return translate('walletUnitAttestation.ready');
      } else {
        return translate('walletUnitAttestation.updated');
      }
    }
    if (!error) {
      if (route.params.refresh) {
        return translate('walletUnitAttestation.noInternet.refresh');
      } else {
        return translate('walletUnitAttestation.noInternet.register');
      }
    }
    return translateError(error, translate(`walletUnitAttestation.error`));
  }, [error, registeredNewWallet, status, route.params.refresh]);

  const button =
    status === LoaderViewState.Warning || status === LoaderViewState.Error
      ? {
          onPress: handleRetry,
          testID: concatTestID(testID, 'retry'),
          title: translate('common.retry'),
        }
      : undefined;

  const secondaryButton =
    !config.walletProvider.required &&
    (status === LoaderViewState.Warning || status === LoaderViewState.Error)
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
      onClose={config.walletProvider.required ? undefined : closeHandler}
      secondaryButton={secondaryButton}
      state={status}
      testID={testID}
      title={translate('common.walletAttestation')}
    />
  );
};

export default memo(WalletUnitAttestationScreen);
