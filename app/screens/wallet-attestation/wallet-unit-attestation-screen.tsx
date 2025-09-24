import {
  ButtonType,
  concatTestID,
  LoaderViewState,
  Transport,
  useAvailableTransports,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { config } from '../../config';
import {
  useRefreshWalletUnit,
  useRegisterWalletUnit,
} from '../../hooks/wallet-unit';
import { translate, translateError } from '../../i18n';
import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const testID = 'WalletUnitAttestationScreen';

const WalletUnitAttestationScreen = () => {
  const [error, setError] = useState<unknown>();
  const [status, setStatus] = useState<
    | LoaderViewState.InProgress
    | LoaderViewState.Warning
    | LoaderViewState.Error
    | LoaderViewState.Success
  >(LoaderViewState.InProgress);
  const { availableTransport } = useAvailableTransports([Transport.HTTP]);
  const hasInternetConnection = availableTransport?.includes(Transport.HTTP);

  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const route = useRoute<RootRouteProp<'WalletUnitAttestation'>>();
  const { mutateAsync: registerWalletUnit, isSuccess: registeredNewWallet } =
    useRegisterWalletUnit();
  const { mutateAsync: refreshWalletUnit } = useRefreshWalletUnit();

  const closeHandler = useCallback(() => {
    if (route.params?.resetToDashboard) {
      resetNavigationAction(rootNavigation, [
        { name: 'Dashboard', params: { screen: 'Wallet' } },
      ]);
    } else {
      rootNavigation.goBack();
    }
  }, [rootNavigation, route.params?.resetToDashboard]);

  const handleRegisterOrRefresh = useCallback(async () => {
    if (!hasInternetConnection) {
      setStatus(LoaderViewState.Warning);
      return;
    }
    try {
      setStatus(LoaderViewState.InProgress);
      if (route.params.refresh) {
        await refreshWalletUnit();
      } else {
        await registerWalletUnit();
      }
      setStatus(LoaderViewState.Success);
      closeHandler();
    } catch (err) {
      if (config.walletProvider.required) {
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
    route.params.refresh,
  ]);

  useEffect(() => {
    handleRegisterOrRefresh();
  }, [handleRegisterOrRefresh]);

  const handleRetry = useCallback(() => {
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
      return translate('walletUnitAttestation.noInternet');
    }
    return translateError(error, translate(`walletUnitAttestation.error`));
  }, [error, registeredNewWallet, status]);

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
