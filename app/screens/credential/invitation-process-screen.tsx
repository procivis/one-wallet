import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useInvitationHandler } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import { CredentialManagementNavigationProp } from '../../navigators/credential-management/credential-management-routes';
import { InvitationRouteProp } from '../../navigators/invitation/invitation-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const InvitationProcessScreen: FunctionComponent = () => {
  const navigation =
    useNavigation<CredentialManagementNavigationProp<'Invitation'>>();
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const route = useRoute<InvitationRouteProp<'Processing'>>();
  const { invitationUrl } = route.params;
  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();

  const [state, setState] = useState<
    LoadingResultState.InProgress | LoadingResultState.Failure
  >(LoadingResultState.InProgress);
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
        setState(LoadingResultState.Failure);
      });
  }, [handleInvitation, invitationUrl, navigation]);

  const onConfirm = useCallback(() => {
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('invitation.process.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onClose={onConfirm}
      state={state}
      subtitle={translate(`invitation.process.${state}.subtitle`)}
      successCloseButtonLabel={translate('invitation.process.close')}
      testID="InvitationProcessScreen"
      title={translate(`invitation.process.${state}.title`)}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default InvitationProcessScreen;
