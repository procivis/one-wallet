import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { useCredentialAccept } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { IssueCredentialRouteProp } from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

const CredentialAcceptProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const route = useRoute<IssueCredentialRouteProp<'Processing'>>();

  useBlockOSBackNavigation();

  const [state, setState] = useState<
    LoadingResultState.InProgress | LoadingResultState.Success | LoadingResultState.Failure
  >(LoadingResultState.InProgress);
  const { interactionId } = route.params;
  const { mutateAsync: acceptCredential } = useCredentialAccept();

  useEffect(() => {
    acceptCredential(interactionId)
      .then(() => setState(LoadingResultState.Success))
      .catch((e) => {
        reportException(e, 'Accept credential failure');
        setState(LoadingResultState.Failure);
      });
  }, [acceptCredential, interactionId]);

  const onClose = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      testID="CredentialAcceptProcessScreen"
      variation={LoadingResultVariation.Neutral}
      state={state}
      title={translate(`credentialAccept.${state}.title`)}
      subtitle={translate(`credentialAccept.${state}.subtitle`)}
      onClose={onClose}
      successCloseButtonLabel={translate('credentialAccept.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      failureCloseButtonLabel={translate('credentialAccept.close')}
    />
  );
};

export default CredentialAcceptProcessScreen;
