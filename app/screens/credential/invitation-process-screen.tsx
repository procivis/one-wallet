import {
  LoaderViewState,
  LoadingResultScreen,
} from '@procivis/one-react-native-components';
import { useBlockOSBackNavigation } from '@procivis/react-native-components';
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
  useState,
} from 'react';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
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
  const [error, setError] = useState<OneError>();

  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();

  const [state, setState] = useState<
    LoaderViewState.InProgress | LoaderViewState.Warning
  >(LoaderViewState.InProgress);
  useEffect(() => {
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
        reportException(err, 'Invitation failure');
        setState(LoaderViewState.Warning);
        setError(err);
      });
  }, [handleInvitation, invitationUrl, managementNavigation]);

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
      header={{
        leftItem: HeaderCloseModalButton,
        modalHandleVisible: true,
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton onPress={infoPressHandler} />
          ) : undefined,
      }}
      loader={{
        animate: isFocused,
        label: translate(`invitation.process.${state}.title`),
        state,
        testID: 'InvitationProcessScreen.animation',
      }}
      testID="InvitationProcessScreen"
    />
  );
};

export default InvitationProcessScreen;
