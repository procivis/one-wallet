import {
  LoaderViewState,
  LoadingResultScreen,
} from '@procivis/one-react-native-components';
import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useInvitationHandler } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import { CredentialManagementNavigationProp } from '../../navigators/credential-management/credential-management-routes';
import { InvitationRouteProp } from '../../navigators/invitation/invitation-routes';
import { reportException } from '../../utils/reporting';

const InvitationProcessScreen: FunctionComponent = () => {
  const navigation =
    useNavigation<CredentialManagementNavigationProp<'Invitation'>>();
  const route = useRoute<InvitationRouteProp<'Processing'>>();
  const { invitationUrl } = route.params;

  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();

  const [state, setState] = useState<
    LoaderViewState.InProgress | LoaderViewState.Warning
  >(LoaderViewState.InProgress);
  useEffect(() => {
    handleInvitation(invitationUrl)
      .then((result) => {
        if ('credentialIds' in result) {
          navigation.navigate('IssueCredential', {
            params: {
              credentialId: result.credentialIds[0],
              interactionId: result.interactionId,
            },
            screen: 'CredentialOffer',
          });
        } else {
          navigation.navigate('ShareCredential', {
            params: { request: result },
            screen: 'ProofRequest',
          });
        }
      })
      .catch((err) => {
        reportException(err, 'Invitation failure');
        setState(LoaderViewState.Warning);
      });
  }, [handleInvitation, invitationUrl, navigation]);

  return (
    <LoadingResultScreen
      header={{
        leftItem: HeaderCloseModalButton,
        modalHandleVisible: true,
      }}
      loader={{
        label: translate(`invitation.process.${state}.title`),
        state,
      }}
      testID="InvitationProcessScreen"
    />
  );
};

export default InvitationProcessScreen;
