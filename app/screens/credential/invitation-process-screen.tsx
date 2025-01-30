import {
  BluetoothError,
  BluetoothState,
  ExchangeProtocol,
  getInvitationUrlTransports,
  InternetError,
  InternetState,
  LoaderViewState,
  LoadingResultScreen,
  Transport,
  useAvailableTransports,
  useBlockOSBackNavigation,
  useInvitationHandler,
  useOpenSettings,
} from '@procivis/one-react-native-components';
import { OneError } from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { config } from '../../config';
import { useBlePermissions } from '../../hooks/ble-permissions';
import { translate, translateError, TxKeyPath } from '../../i18n';
import { CredentialManagementNavigationProp } from '../../navigators/credential-management/credential-management-routes';
import { InvitationRouteProp } from '../../navigators/invitation/invitation-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const InvitationProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const managementNavigation =
    useNavigation<CredentialManagementNavigationProp<'Invitation'>>();
  const route = useRoute<InvitationRouteProp<'Processing'>>();
  const isFocused = useIsFocused();
  const { invitationUrl } = route.params;
  const [error, setError] = useState<unknown>();
  const [canHandleInvitation, setCanHandleInvitation] = useState<boolean>();
  const [invitationSupportedTransports] = useState(
    getInvitationUrlTransports(
      route.params.invitationUrl,
      config.customOpenIdUrlScheme,
    ),
  );
  const { availableTransport, transportError } = useAvailableTransports(
    invitationSupportedTransports,
  );

  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions(ExchangeProtocol.OPENID4VC);

  const [adapterEnabled, setAdapterEnabled] = useState<boolean>(true);
  const {
    openAppPermissionSettings,
    openBleSettings,
    openMobileNetworkSettings,
    openWiFiSettings,
  } = useOpenSettings();

  const isBleInteraction = useMemo(() => {
    if (!invitationSupportedTransports.includes(Transport.Bluetooth)) {
      return false;
    }
    if (invitationSupportedTransports.length === 1) {
      return true;
    }
    if (!availableTransport) {
      return false;
    }
    return (
      (availableTransport.length === 1 &&
        availableTransport[0] === Transport.Bluetooth) ||
      (availableTransport.length === 0 && permissionStatus === 'denied')
    );
  }, [availableTransport, invitationSupportedTransports, permissionStatus]);

  const [state, setState] = useState<
    LoaderViewState.InProgress | LoaderViewState.Warning
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

  useEffect(() => {
    if (canHandleInvitation !== undefined) {
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
    const transportAvailable = invitationSupportedTransports.some((t) =>
      availableTransport.includes(t),
    );
    if (transportAvailable) {
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
    invitationSupportedTransports,
    permissionStatus,
    transportError,
    canHandleInvitation,
  ]);

  useEffect(() => {
    if (!canHandleInvitation || !availableTransport) {
      return;
    }

    const transports = invitationSupportedTransports.filter((t) =>
      availableTransport.includes(t),
    );
    const transport = transports.includes(Transport.MQTT)
      ? Transport.MQTT
      : transports[0];
    if (!transport) {
      return;
    }

    handleInvitation({ invitationUrl, transport })
      .then((result) => {
        if ('credentialIds' in result) {
          managementNavigation.replace('IssueCredential', {
            params: {
              credentialId: result.credentialIds[0],
              interactionId: result.interactionId,
              txCode: result?.txCode,
            },
            screen: 'CredentialOffer',
          });
        } else {
          managementNavigation.replace('ShareCredential', {
            params: { request: result },
            screen: 'ProofRequest',
          });
        }
      })
      .catch((err: unknown) => {
        if (
          err instanceof OneError &&
          err.cause?.includes('BLE adapter not enabled')
        ) {
          setAdapterEnabled(false);
        } else {
          setError(err);
        }
        setState(LoaderViewState.Warning);
      });
  }, [
    availableTransport,
    canHandleInvitation,
    handleInvitation,
    invitationSupportedTransports,
    invitationUrl,
    managementNavigation,
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

  const openSettingsButton = useMemo(() => {
    if (state !== LoaderViewState.Warning) {
      return;
    }

    if (
      !transportError.internet &&
      (!transportError.ble || transportError.ble === BluetoothState.Unavailable)
    ) {
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
    transportError,
    openMobileNetworkSettings,
    openWiFiSettings,
    openBleSettings,
    openAppPermissionSettings,
  ]);

  const label = useMemo(() => {
    const bleErrorKeys: Record<BluetoothError, TxKeyPath> = {
      [BluetoothState.Unauthorized]:
        'invitation.process.blePermissionMissing.title',
      [BluetoothState.Unavailable]:
        'invitation.process.bleAdapterUnavailable.title',
      [BluetoothState.Disabled]: 'invitation.process.bleAdapterDisabled.title',
    };

    const internetErrorKeys: Record<InternetError, TxKeyPath> = {
      [InternetState.Unreachable]:
        'invitation.process.internetUnreachable.title',
      [InternetState.Disabled]: 'invitation.process.internetDisabled.title',
    };

    if (canHandleInvitation) {
      if (
        state === LoaderViewState.Warning &&
        isBleInteraction &&
        !adapterEnabled
      ) {
        return translate('invitation.process.bleAdapterDisabled.title');
      }
      return translateError(
        error,
        translate(`invitation.process.${state}.title`),
      );
    }

    if (state !== LoaderViewState.Warning) {
      return translate(`invitation.process.${state}.title`);
    }
    if (
      invitationSupportedTransports.includes(Transport.Bluetooth) &&
      invitationSupportedTransports.includes(Transport.MQTT) &&
      transportError.internet &&
      transportError.ble
    ) {
      return translate('invitation.process.connectivityUnavailable.title');
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

    return translateError(
      error,
      translate(`invitation.process.${state}.title`),
    );
  }, [
    error,
    canHandleInvitation,
    state,
    invitationSupportedTransports,
    transportError,
    isBleInteraction,
    adapterEnabled,
  ]);

  return (
    <LoadingResultScreen
      button={openSettingsButton}
      header={{
        leftItem: (
          <HeaderCloseModalButton testID="InvitationProcessScreen.header.close" />
        ),
        rightItem:
          state === LoaderViewState.Warning && error ? (
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
      testID="InvitationProcessScreen"
    />
  );
};

export default InvitationProcessScreen;
