import {
  BluetoothError,
  BluetoothState,
  ButtonType,
  getInvitationUrlTransports,
  InternetError,
  InternetState,
  isUrlValid,
  isValidHttpUrl,
  LoaderViewState,
  LoadingResultScreen,
  parseUniversalLink,
  reportException,
  shareUrl,
  Transport,
  useAvailableTransports,
  useBlockOSBackNavigation,
  useContinueIssuance,
  useInvitationHandler,
  useOpenSettings,
  useWalletUnitDetail,
  VerificationProtocol,
} from '@procivis/one-react-native-components';
import {
  InvitationResult,
  KeyStorageSecurity,
  OneError,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { closeBrowser, openBrowser } from '@swan-io/react-native-browser';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Linking } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { config } from '../../config';
import { useBlePermissions } from '../../hooks/ble-permissions';
import { translate, translateError, TxKeyPath } from '../../i18n';
import { useStores } from '../../models';
import { CredentialManagementNavigationProp } from '../../navigators/credential-management/credential-management-routes';
import { InvitationRouteProp } from '../../navigators/invitation/invitation-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { isInvalidInvitationUrlError } from '../../utils/error';

const bleErrorKeys: Record<BluetoothError, TxKeyPath> = {
  [BluetoothState.Unauthorized]:
    'info.invitation.process.blePermissionMissing.title',
  [BluetoothState.Unavailable]:
    'info.invitation.process.bleAdapterUnavailable.title',
  [BluetoothState.Disabled]: 'info.invitation.process.bleAdapterDisabled.title',
};

const internetErrorKeys: Record<InternetError, TxKeyPath> = {
  [InternetState.Unreachable]:
    'info.invitation.process.internetUnreachable.title',
  [InternetState.Disabled]: 'info.invitation.process.internetDisabled.title',
};

const InvitationProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const managementNavigation =
    useNavigation<CredentialManagementNavigationProp<'Invitation'>>();
  const route = useRoute<InvitationRouteProp<'Processing'>>();
  const {
    walletStore: { registeredWalletUnitId, isRSESetup },
  } = useStores();
  const { data: walletUnitDetail, isLoading: isLoadingWU } =
    useWalletUnitDetail(registeredWalletUnitId);
  const isFocused = useIsFocused();
  const [invitationUrl, setInvitationUrl] = useState(
    route.params.invitationUrl,
  );
  const [error, setError] = useState<unknown>();
  const [canHandleInvitation, setCanHandleInvitation] = useState<boolean>();
  const [redirectState, setRedirectState] = useState<'redirecting' | 'done'>();
  const [invitationSupportedTransports, setInvitationSupportedTransports] =
    useState(
      getInvitationUrlTransports(
        route.params.invitationUrl,
        config.customOpenIdUrlScheme,
      ),
    );
  const { availableTransport, transportError } = useAvailableTransports(
    invitationSupportedTransports,
  );
  const { mutateAsync: continueIssuance } = useContinueIssuance();

  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();
  const [invitationResult, setInvitationResult] = useState<InvitationResult>();
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions(VerificationProtocol.OPENID4VP_PROXIMITY_DRAFT00);

  const [adapterEnabled, setAdapterEnabled] = useState<boolean>(true);
  const {
    openAppPermissionSettings,
    openBleSettings,
    openMobileNetworkSettings,
    openWiFiSettings,
  } = useOpenSettings();

  const isBleInteraction = useMemo(() => {
    if (!availableTransport) {
      return false;
    }
    return (
      (availableTransport.length === 1 &&
        availableTransport[0] === Transport.Bluetooth) ||
      (availableTransport.length === 0 && permissionStatus === 'denied')
    );
  }, [availableTransport, permissionStatus]);

  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Success>
  >(LoaderViewState.InProgress);

  useEffect(() => {
    if (permissionStatus === 'denied' && isBleInteraction) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!permissionStatus]);

  useEffect(() => {
    if (isBleInteraction && isFocused) {
      checkPermissions();
      setAdapterEnabled(true);
    }
  }, [isFocused, isBleInteraction, checkPermissions, requestPermission]);

  const allPermissionsGranted = useMemo(() => {
    if (!isBleInteraction) {
      return true;
    }

    return permissionStatus && permissionStatus === 'granted';
  }, [isBleInteraction, permissionStatus]);

  // Sets canHandleInvitation and loader state based on transport availability
  useEffect(() => {
    if (canHandleInvitation) {
      return;
    }
    if (!availableTransport) {
      setState(LoaderViewState.InProgress);
      return;
    }
    if (
      availableTransport.length === 0 &&
      transportError.ble &&
      transportError.internet
    ) {
      if (isBleInteraction && permissionStatus === 'denied') {
        setState(LoaderViewState.InProgress);
      } else {
        setState(LoaderViewState.Warning);
        setCanHandleInvitation(false);
      }
      return;
    }

    if (availableTransport.length) {
      setCanHandleInvitation(true);
      setState(LoaderViewState.InProgress);
      return;
    }
    setState(LoaderViewState.Warning);
    setCanHandleInvitation(false);
  }, [
    isBleInteraction,
    adapterEnabled,
    allPermissionsGranted,
    availableTransport,
    permissionStatus,
    transportError,
    canHandleInvitation,
  ]);

  const handleContinueIssuance = useCallback(
    async (url: string) => {
      if (
        config.requestCredentialRedirectUri &&
        url.startsWith(config.requestCredentialRedirectUri)
      ) {
        closeBrowser();
        const result = await continueIssuance(url);
        managementNavigation.replace('IssueCredential', {
          params: {
            invitationResult: result,
          },
          screen: 'CredentialOffer',
        });
      }
    },
    [continueIssuance, managementNavigation],
  );

  useEffect(() => {
    const subscription = Linking.addListener(
      'url',
      ({ url }: { url: string }) => {
        handleContinueIssuance(url);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [handleContinueIssuance]);

  useEffect(() => {
    if (
      !canHandleInvitation ||
      !availableTransport ||
      redirectState === 'redirecting'
    ) {
      return;
    }

    if (!redirectState && isValidHttpUrl(invitationUrl)) {
      setRedirectState('redirecting');
      RNBlobUtil.config({ followRedirect: false })
        .fetch('GET', invitationUrl)
        .then((response) => {
          setRedirectState('done');
          if (response.respInfo.redirects.length === 0) {
            setRedirectState('done');
            return;
          }
          const headers =
            typeof response.respInfo.headers === 'object'
              ? (response.respInfo.headers as Record<any, any>)
              : undefined;
          const redirectUrl =
            headers && typeof headers === 'object' && 'Location' in headers
              ? (headers['Location'] as string)
              : undefined;
          if (!redirectUrl) {
            setRedirectState('done');
            return;
          }
          const newInvitationUrl =
            parseUniversalLink(redirectUrl) ?? redirectUrl;
          if (
            newInvitationUrl &&
            !isValidHttpUrl(newInvitationUrl) &&
            newInvitationUrl !== invitationUrl
          ) {
            setInvitationSupportedTransports(
              getInvitationUrlTransports(
                newInvitationUrl,
                config.customOpenIdUrlScheme,
              ),
            );
            setInvitationUrl(newInvitationUrl);
          }
          setRedirectState('done');
        })
        .catch(() => {
          setRedirectState('done');
        });
      return;
    }

    const transport = availableTransport.includes(Transport.MQTT)
      ? Transport.MQTT
      : availableTransport[0];
    if (!transport) {
      return;
    }

    handleInvitation({
      redirectUri: config.requestCredentialRedirectUri,
      transport: [transport],
      url: invitationUrl,
    })
      .then((result) => {
        setInvitationResult(result);
      })
      .catch((err: unknown) => {
        setState(LoaderViewState.Warning);
        if (
          err instanceof OneError &&
          err.cause?.includes('BLE adapter not enabled')
        ) {
          setAdapterEnabled(false);
        } else {
          setError(err);
          if (
            err &&
            isInvalidInvitationUrlError(err) &&
            !isValidHttpUrl(invitationUrl)
          ) {
            setState(LoaderViewState.Error);
          }
        }
      });
  }, [
    availableTransport,
    canHandleInvitation,
    handleInvitation,
    invitationUrl,
    managementNavigation,
    redirectState,
  ]);

  useEffect(() => {
    if (!invitationResult) {
      return;
    }
    if ('authorizationCodeFlowUrl' in invitationResult) {
      openBrowser(invitationResult.authorizationCodeFlowUrl);
      return;
    } else if ('proofId' in invitationResult) {
      managementNavigation.replace('ShareCredential', {
        params: { request: invitationResult },
        screen: 'ProofRequest',
      });
    } else {
      if (isLoadingWU) {
        return;
      }
      if (invitationResult.txCode) {
        managementNavigation.replace('IssueCredential', {
          params: {
            invitationResult: invitationResult,
          },
          screen: 'CredentialConfirmationCode',
        });
      } else {
        const needsRSESetup =
          invitationResult.keyStorageSecurityLevels?.includes(
            KeyStorageSecurity.HIGH,
          ) && !isRSESetup;
        managementNavigation.replace('IssueCredential', {
          params: {
            invitationResult: invitationResult,
          },
          screen: needsRSESetup ? 'RSEInfo' : 'CredentialOffer',
        });
      }
    }
  }, [
    invitationResult,
    isRSESetup,
    isLoadingWU,
    managementNavigation,
    rootNavigation,
    walletUnitDetail?.status,
  ]);

  const infoPressHandler = useCallback(() => {
    if (!error) {
      return;
    }
    rootNavigation.navigate('NerdMode', {
      params: { error },
      screen: 'ErrorNerdMode',
    });
  }, [error, rootNavigation]);

  const shareButton = useMemo(() => {
    if (error && isValidHttpUrl(invitationUrl)) {
      const url = new URL(invitationUrl);
      const title = url.host;
      return {
        onPress: () => {
          shareUrl(invitationUrl).catch((err) =>
            reportException(
              err,
              `Failed to share invitation URL: ${invitationUrl}`,
            ),
          );
        },
        title,
      };
    }
  }, [error, invitationUrl]);

  const button = useMemo(() => {
    if (state === LoaderViewState.InProgress) {
      return;
    }

    if (
      error &&
      isInvalidInvitationUrlError(error) &&
      isValidHttpUrl(invitationUrl)
    ) {
      return {
        onPress: () => {
          Linking.openURL(invitationUrl).catch((err) =>
            reportException(
              err,
              `Failed to open invitation URL: ${invitationUrl}`,
            ),
          );
        },
        title: translate('common.openInBrowser'),
      };
    }

    if (
      !transportError.internet &&
      (!transportError.ble || transportError.ble === BluetoothState.Unavailable)
    ) {
      if (!transportError.ble) {
        return {
          onPress: managementNavigation.goBack,
          title: translate('common.close'),
          type: ButtonType.Secondary,
        };
      }
      return;
    }

    return {
      onPress: () => {
        if (transportError.internet === InternetState.Disabled) {
          openMobileNetworkSettings();
        } else if (transportError.internet === InternetState.Unreachable) {
          openWiFiSettings();
        } else if (transportError.ble !== BluetoothState.Unauthorized) {
          // os Bluetooth adapter settings, user can enable Bluetooth or allow for new connections (iOS)
          openBleSettings();
        } else {
          // application settings, user can enable required permissions
          openAppPermissionSettings();
        }
      },
      title: translate('common.openSettings'),
    };
  }, [
    state,
    error,
    invitationUrl,
    transportError.internet,
    transportError.ble,
    managementNavigation.goBack,
    openMobileNetworkSettings,
    openWiFiSettings,
    openBleSettings,
    openAppPermissionSettings,
  ]);

  const label = useMemo(() => {
    if (
      canHandleInvitation &&
      (!error || !isInvalidInvitationUrlError(error))
    ) {
      if (
        state === LoaderViewState.Warning &&
        isBleInteraction &&
        !adapterEnabled
      ) {
        return translate('info.invitation.process.bleAdapterDisabled.title');
      }
      return translateError(
        error,
        translate(`invitationProcessTitle.${state}`),
      );
    }

    if (state === LoaderViewState.InProgress) {
      return translate(`invitationProcessTitle.${state}`);
    }

    if (
      invitationSupportedTransports.includes(Transport.Bluetooth) &&
      invitationSupportedTransports.includes(Transport.MQTT) &&
      transportError.internet &&
      transportError.ble
    ) {
      return translate('info.invitation.process.connectivityUnavailable.title');
    } else if (
      invitationSupportedTransports.includes(Transport.Bluetooth) &&
      transportError.ble
    ) {
      return translate(bleErrorKeys[transportError.ble]);
    } else if (
      (invitationSupportedTransports.includes(Transport.MQTT) ||
        invitationSupportedTransports.includes(Transport.HTTP)) &&
      transportError.internet
    ) {
      return translate(internetErrorKeys[transportError.internet]);
    }

    if (!availableTransport?.length) {
      if (invitationSupportedTransports.length === 1) {
        if (invitationSupportedTransports[0] === Transport.Bluetooth) {
          return translate(
            'info.invitation.process.bleTransportDisabled.title',
          );
        }
      }
      if (invitationSupportedTransports.includes(Transport.MQTT)) {
        return translate('info.invitation.process.mqttTransportDisabled.title');
      }
      if (invitationSupportedTransports.includes(Transport.HTTP)) {
        return translate('info.invitation.process.httpTransportDisabled.title');
      }
    }

    let errorMessage = translate(
      'info.invitation.process.unsupportedInvitation.title',
    );
    if (isValidHttpUrl(invitationUrl)) {
      errorMessage = translate(
        'info.invitation.process.unsupportedInvitationUrl.title',
      );
    } else if (error && !isUrlValid(invitationUrl)) {
      errorMessage = translate('info.errorScreen.title');
    }

    return translateError(error, errorMessage);
  }, [
    error,
    canHandleInvitation,
    availableTransport,
    state,
    invitationUrl,
    invitationSupportedTransports,
    transportError,
    isBleInteraction,
    adapterEnabled,
  ]);

  return (
    <LoadingResultScreen
      button={button}
      header={{
        leftItem: (
          <HeaderCloseModalButton testID="InvitationProcessScreen.header.close" />
        ),
        rightItem:
          (state === LoaderViewState.Warning ||
            state === LoaderViewState.Error) &&
          error ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID="InvitationProcessScreen.header.info"
            />
          ) : undefined,
      }}
      loader={{
        animate: isFocused,
        label,
        state,
        testID: 'InvitationProcessScreen.animation',
      }}
      shareButton={shareButton}
      testID="InvitationProcessScreen"
    />
  );
};

export default InvitationProcessScreen;
