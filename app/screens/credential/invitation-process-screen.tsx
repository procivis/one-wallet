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
import { useInvitationHandler } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
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

  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions();

  const [adapterEnabled, setAdapterEnabled] = useState<boolean>(true);
  const { openAppPermissionSettings, openBleSettings } = useOpenBleSettings();

  const isBleInteraction = useMemo(
    () => invitationUrl.toLocaleLowerCase().startsWith('openid4vp://connect?'),
    [invitationUrl],
  );

  const [state, setState] = useState<
    LoaderViewState.InProgress | LoaderViewState.Warning
  >(LoaderViewState.InProgress);

  useEffect(() => {
    if (permissionStatus === 'denied' && isBleInteraction) {
      requestPermission();
    }
  }, [permissionStatus, requestPermission, isBleInteraction]);

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
    if (!isBleInteraction) {
      setState(LoaderViewState.InProgress);
    } else {
      if (allPermissionsGranted === false || adapterEnabled === false) {
        setState(LoaderViewState.Warning);
      } else {
        setState(LoaderViewState.InProgress);
      }
    }
  }, [isBleInteraction, adapterEnabled, allPermissionsGranted]);

  useEffect(() => {
    if (isBleInteraction && (!allPermissionsGranted || !adapterEnabled)) {
      return;
    }

    setTimeout(() => {
      handleInvitation(invitationUrl)
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
    }, 1000);
  }, [
    handleInvitation,
    invitationUrl,
    managementNavigation,
    allPermissionsGranted,
    adapterEnabled,
    isBleInteraction,
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
    if (state !== LoaderViewState.Warning || !isBleInteraction) {
      return;
    }

    if (allPermissionsGranted && adapterEnabled) {
      return;
    }

    return {
      onPress: () => {
        if (!allPermissionsGranted) {
          // application settings, user can enable required permissions
          openAppPermissionSettings();
        } else if (!adapterEnabled) {
          // os Bluetooth adapter settings, user can enable Bluetooth or allow for new connections (iOS)
          openBleSettings();
        }
      },
      title: translate('common.openSettings'),
    };
  }, [
    state,
    isBleInteraction,
    openAppPermissionSettings,
    openBleSettings,
    allPermissionsGranted,
    adapterEnabled,
  ]);

  const label = useMemo(() => {
    if (state === LoaderViewState.Warning && isBleInteraction) {
      if (!allPermissionsGranted) {
        return translate('invitation.process.blePermissionMissing.title');
      }
      if (!adapterEnabled) {
        return translate('invitation.process.bleAdapterDisabled.title');
      }
    }

    return translate(`invitation.process.${state}.title`);
  }, [state, allPermissionsGranted, adapterEnabled, isBleInteraction]);

  return (
    <LoadingResultScreen
      button={openSettingsButton}
      header={{
        leftItem: HeaderCloseModalButton,
        rightItem:
          state === LoaderViewState.Warning ? (
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
