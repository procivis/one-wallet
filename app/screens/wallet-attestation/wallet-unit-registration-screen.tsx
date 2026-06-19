import {
  ButtonType,
  concatTestID,
  LoaderViewState,
  Transport,
  useActivateWalletUnit,
  useAppColorScheme,
  useAvailableTransports,
  useBlockOSBackNavigation,
  useRegisterWalletUnit,
  useWalletUnitDetail,
  useWalletUnitStatus,
} from '@procivis/one-react-native-components';
import {
  HolderWalletUnit,
  WalletUnitStatus,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AuthConfiguration, authorize } from 'react-native-app-auth';

import { ProcessingView } from '../../components/common/processing-view';
import { config } from '../../config';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import {
  WalletUnitRegistrationNavigationProp,
  WalletUnitRegistrationRouteProp,
} from '../../navigators/wallet-unit-registration/wallet-unit-registration-routes';
import { resetNavigationAction } from '../../utils/navigation';

const testID = 'WalletUnitRegistrationScreen';

const WalletUnitRegistrationScreen = () => {
  const colorScheme = useAppColorScheme();
  const [error, setError] = useState<unknown>();
  const [status, setStatus] = useState<LoaderViewState>(
    LoaderViewState.InProgress,
  );
  const [walletUnitStatus, setWalletUnitStatus] = useState<WalletUnitStatus>();
  const {
    walletStore,
    walletStore: { walletProvider, walletUnitId },
    walletStore: {
      walletProvider: { featureFlags, userAuthentication },
    },
  } = useStores();
  const { availableTransport } = useAvailableTransports([Transport.HTTP]);
  const hasInternetConnection = availableTransport?.includes(Transport.HTTP);
  const handled = useRef<boolean>(false);
  const cancelled = useRef<boolean>(false);

  const rootNavigation = useNavigation<RootNavigationProp>();
  const wuaNavigation =
    useNavigation<WalletUnitRegistrationNavigationProp<'Registration'>>();
  const route = useRoute<WalletUnitRegistrationRouteProp<'Registration'>>();
  const { data: walletUnit, refetch } = useWalletUnitDetail(walletUnitId);
  const { mutateAsync: registerWalletUnit, isSuccess: registeredNewWallet } =
    useRegisterWalletUnit();
  const { mutateAsync: activateWalletUnit } = useActivateWalletUnit();
  const { mutateAsync: refreshWalletUnit } = useWalletUnitStatus();

  useEffect(() => {
    if (!walletUnit || walletUnitStatus === walletUnit.status) {
      return;
    }
    setWalletUnitStatus(walletUnit.status);
  }, [walletUnit, walletUnitStatus]);

  useBlockOSBackNavigation(
    walletUnitStatus === undefined || status === LoaderViewState.Error,
  );

  const close = useCallback(
    (
      status: LoaderViewState,
      walletUnitStatus: WalletUnitStatus | undefined,
    ) => {
      cancelled.current = true;
      const resetToDashboard = route.params?.resetToDashboard;
      const hasWalletUnit = walletUnitStatus !== undefined;
      const isHardError = status === LoaderViewState.Error;
      if (
        resetToDashboard === true &&
        featureFlags?.trustEcosystemsEnabled &&
        hasWalletUnit &&
        !isHardError
      ) {
        resetNavigationAction(rootNavigation, [
          { name: 'Dashboard', params: { screen: 'Wallet' } },
          {
            name: 'TrustEcosystems',
            params: { preselect: true, resetToDashboard: false },
          },
        ]);
        return;
      }
      const errorStatuses = [LoaderViewState.Error, LoaderViewState.Warning];
      if (
        resetToDashboard === true ||
        (resetToDashboard === 'onError' && errorStatuses.includes(status))
      ) {
        resetNavigationAction(rootNavigation, [
          { name: 'Dashboard', params: { screen: 'Wallet' } },
        ]);
      } else {
        const state = wuaNavigation.getState();
        wuaNavigation.goBack();
        if (state.routes.length == 2) {
          wuaNavigation.goBack();
        }
      }
    },
    [
      featureFlags?.trustEcosystemsEnabled,
      rootNavigation,
      wuaNavigation,
      route.params?.resetToDashboard,
    ],
  );

  const closeHandler = useCallback(() => {
    close(status, walletUnitStatus);
  }, [close, status, walletUnitStatus]);

  const handleActivateWalletUnit = useCallback(
    async (id: string, nonce: string) => {
      if (!userAuthentication) {
        return;
      }
      const config: AuthConfiguration = {
        additionalParameters: {
          nonce,
        },
        clientId: userAuthentication.clientId,
        issuer: userAuthentication.identityProvider,
        redirectUrl: userAuthentication.redirectUri,
        scopes: ['openid', 'profile'],
      };
      try {
        const result = await authorize(config);
        await activateWalletUnit({
          id,
          userIdToken: result.idToken,
        });
      } catch (e) {
        console.error(e);
        throw new Error(translate('walletUnitRegistration.inactive'));
      }
    },
    [activateWalletUnit, userAuthentication],
  );

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
      let noewWalletUnitStatus: WalletUnitStatus | undefined;
      let register = true;

      if (
        route.params.operation === 'refresh' ||
        walletUnitStatus === WalletUnitStatus.PENDING
      ) {
        register = false;
        await refreshWalletUnit(walletUnitId);
        let refetchedWalletUnit: HolderWalletUnit | undefined = (
          await refetch()
        ).data;
        if (
          refetchedWalletUnit?.status === WalletUnitStatus.PENDING &&
          refetchedWalletUnit.userNonce
        ) {
          try {
            await handleActivateWalletUnit(
              refetchedWalletUnit.id,
              refetchedWalletUnit.userNonce,
            );
          } catch (e) {
            refetchedWalletUnit = (await refetch()).data;
            if (refetchedWalletUnit?.status !== WalletUnitStatus.ERROR) {
              throw e;
            }
          }
        }
        if (refetchedWalletUnit?.status === WalletUnitStatus.ERROR) {
          register = true;
        }
      }

      if (register) {
        if (!config.walletProvider) {
          throw new Error('No wallet provider specified');
        }

        const registeredWalletUnit = await registerWalletUnit({
          trustedRpRequired: false,
          walletProvider: {
            type: config.walletProvider.type,
            url: `${config.walletProvider.url}/ssi/wallet-provider/v1/${config.walletProvider.type}`,
          },
        });
        noewWalletUnitStatus = registeredWalletUnit.status;

        if (userAuthentication && registeredWalletUnit.userNonce) {
          try {
            await handleActivateWalletUnit(
              registeredWalletUnit.id,
              registeredWalletUnit.userNonce,
            );
            const { data: refetchedWalletUnit } = await refetch();
            if (refetchedWalletUnit) {
              noewWalletUnitStatus = refetchedWalletUnit.status;
            }
          } catch (e) {
            if (registeredWalletUnit.status === WalletUnitStatus.PENDING) {
              walletStore.walletUnitIdSetup(registeredWalletUnit.id);
              setWalletUnitStatus(registeredWalletUnit.status);
              throw e;
            }
          }
        }

        walletStore.walletUnitIdSetup(registeredWalletUnit.id);
        if (registeredWalletUnit.status === WalletUnitStatus.UNATTESTED) {
          throw new Error(translate('walletUnitRegistration.unattested'));
        }
      }
      if (cancelled.current) {
        return;
      }
      setStatus(LoaderViewState.Success);
      setWalletUnitStatus(noewWalletUnitStatus);
      close(LoaderViewState.Success, noewWalletUnitStatus);
    } catch (err) {
      if (cancelled.current) {
        return;
      }
      if (walletProvider.walletUnitAttestation.required) {
        setStatus(LoaderViewState.Error);
      } else {
        setStatus(LoaderViewState.Warning);
      }
      setError(err);
    }
  }, [
    close,
    hasInternetConnection,
    refreshWalletUnit,
    registerWalletUnit,
    handleActivateWalletUnit,
    refetch,
    route.params,
    walletProvider.walletUnitAttestation.required,
    walletStore,
    walletUnitId,
    walletUnitStatus,
    userAuthentication,
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
    if (walletUnitStatus === WalletUnitStatus.UNATTESTED) {
      return translate('walletUnitRegistration.unattested');
    } else if (walletUnitStatus === WalletUnitStatus.PENDING) {
      return translate('walletUnitRegistration.inactive');
    }
    if (!error) {
      if (route.params.operation === 'refresh') {
        return translate('walletUnitRegistration.noInternet.refresh');
      } else {
        return translate('walletUnitRegistration.noInternet.register');
      }
    }
    return translateError(error, translate('walletUnitRegistration.error'));
  }, [
    error,
    registeredNewWallet,
    status,
    route.params.operation,
    walletUnitStatus,
  ]);

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
    if (status === LoaderViewState.InProgress) {
      return undefined;
    }
    switch (walletUnitStatus) {
      case WalletUnitStatus.ERROR:
      case WalletUnitStatus.PENDING:
        return retryButton;
      case WalletUnitStatus.UNATTESTED:
        return !walletProvider.walletUnitAttestation.required
          ? closeButton
          : undefined;
      case undefined:
        return undefined;
      default:
        return closeButton;
    }
  }, [
    status,
    closeButton,
    retryButton,
    walletProvider.walletUnitAttestation.required,
    walletUnitStatus,
  ]);

  const secondaryButton = useMemo(() => {
    if (
      status === LoaderViewState.InProgress ||
      walletProvider.walletUnitAttestation.required
    ) {
      return undefined;
    }
    if (
      walletUnitStatus === WalletUnitStatus.ERROR ||
      walletUnitStatus === WalletUnitStatus.PENDING
    ) {
      return {
        onPress: closeHandler,
        testID: concatTestID(testID, 'close'),
        title: translate('common.close'),
        type: ButtonType.Secondary,
      };
    }
    return undefined;
  }, [
    closeHandler,
    status,
    walletProvider.walletUnitAttestation.required,
    walletUnitStatus,
  ]);

  return (
    <ProcessingView
      button={button}
      error={error}
      loaderLabel={loaderLabel}
      onClose={
        !walletProvider.walletUnitAttestation.required && walletUnitStatus
          ? closeHandler
          : undefined
      }
      secondaryButton={secondaryButton}
      state={status}
      style={{ backgroundColor: colorScheme.background }}
      testID={testID}
      title={translate('common.walletActivation')}
    />
  );
};

export default memo(WalletUnitRegistrationScreen);
