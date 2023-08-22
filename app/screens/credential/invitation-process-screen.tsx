import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { useInvitationHandler } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { InvitationRouteProp } from '../../navigators/invitation/invitation-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

const InvitationProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Invitation'>>();
  const route = useRoute<InvitationRouteProp<'Processing'>>();
  const { invitationUrl } = route.params;
  useBlockOSBackNavigation();

  const { mutateAsync: handleInvitation } = useInvitationHandler();

  const [state, setState] = useState(LoadingResultState.InProgress);
  const [issuedCredentialId, setIssuedCredentialId] = useState<string>();
  useEffect(() => {
    handleInvitation(invitationUrl)
      .then((result) => {
        if ('issuedCredentialId' in result) {
          setIssuedCredentialId(result.issuedCredentialId);
          setState(LoadingResultState.Success);
        } else {
          rootNavigation.navigate('ShareCredential', { screen: 'ProofRequest', params: { request: result } });
        }
      })
      .catch((err) => {
        reportException(err, 'Invitation failure');
        setState(LoadingResultState.Failure);
      });
  }, [handleInvitation, invitationUrl, rootNavigation]);

  const onConfirm = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
    if (state === LoadingResultState.Success && issuedCredentialId) {
      rootNavigation.navigate('CredentialDetail', { credentialId: issuedCredentialId });
    }
  }, [rootNavigation, state, issuedCredentialId]);

  return (
    <LoadingResult
      variation={LoadingResultVariation.Neutral}
      state={state}
      title={translate(`invitation.process.${state}.title`)}
      subtitle={translate(`invitation.process.${state}.subtitle`)}
      onClose={onConfirm}
      successCloseButtonLabel={translate('invitation.process.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      failureCloseButtonLabel={translate('invitation.process.close')}
    />
  );
};

export default InvitationProcessScreen;
