import {
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
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
import {
  useBlePermissions,
  useOpenBleSettings,
} from '../../hooks/ble-permissions';
import {
  BluetoothState,
  getInvitationUrlTransports,
  InternetState,
  Transport,
  useAvailableTransports,
} from '../../hooks/connectivity';
import { useInvitationHandler } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import { ProcivisExchangeProtocol } from '../../models/proofs';
import { CredentialManagementNavigationProp } from '../../navigators/credential-management/credential-management-routes';
import { InvitationRouteProp } from '../../navigators/invitation/invitation-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

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
    getInvitationUrlTransports(route.params.invitationUrl),
  );
  const { availableTransport, transportError } = useAvailableTransports(
    invitationSupportedTransports,
  );

  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions(ProcivisExchangeProtocol.OPENID4VC);

  const [adapterEnabled, setAdapterEnabled] = useState<boolean>(true);
  const { openAppPermissionSettings, openBleSettings } = useOpenBleSettings();

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

  const [transitionEnded, setTransitionEnded] = useState(false);
  useEffect(() => {
    return managementNavigation.addListener('transitionEnd', () => {
      setTransitionEnded(true);
    });
  }, [managementNavigation]);

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
    if (!canHandleInvitation || !availableTransport || !transitionEnded) {
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
      .catch((err: OneError) => {
        // TODO Propagate proper error code from core
        if (err.message.includes('adapter is disabled')) {
          setAdapterEnabled(false);
        } else {
          reportException(err, 'Invitation failure');
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
    transitionEnded,
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
        if (
          transportError.internet !== undefined ||
          transportError.ble !== BluetoothState.Unauthorized
        ) {
          // os Bluetooth adapter settings, user can enable Bluetooth or allow for new connections (iOS)
          openBleSettings();
        } else {
          // application settings, user can enable required permissions
          openAppPermissionSettings();
        }
      },
      title: translate('common.openSettings'),
    };
  }, [state, transportError, openBleSettings, openAppPermissionSettings]);

  const label = useMemo(() => {
    if (canHandleInvitation) {
      if (
        state === LoaderViewState.Warning &&
        isBleInteraction &&
        !adapterEnabled
      ) {
        return translate('invitation.process.bleAdapterDisabled.title');
      }
      return translate(`invitation.process.${state}.title`);
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
      switch (transportError.ble) {
        case BluetoothState.Unauthorized:
          return translate('invitation.process.blePermissionMissing.title');
        case BluetoothState.Unavailable:
          return translate('invitation.process.bleAdapterUnavailable.title');
        case BluetoothState.Disabled:
          return translate('invitation.process.bleAdapterDisabled.title');
      }
    } else if (
      (invitationSupportedTransports.includes(Transport.MQTT) ||
        invitationSupportedTransports.includes(Transport.HTTP)) &&
      transportError.internet
    ) {
      if (transportError.internet === InternetState.Unreachable) {
        return translate('invitation.process.internetUnreachable.title');
      } else {
        return translate('invitation.process.internetDisabled.title');
      }
    }

    return translate(`invitation.process.${state}.title`);
  }, [
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
        leftItem: HeaderCloseModalButton,
        rightItem:
          state === LoaderViewState.Warning && error ? (
            <HeaderInfoButton onPress={infoPressHandler} />
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
