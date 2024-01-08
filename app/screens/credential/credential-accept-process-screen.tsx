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
import { Linking } from 'react-native';

import {
  useCredentialAccept,
  useCredentialDetail,
} from '../../hooks/credentials';
import { translate } from '../../i18n';
import { IssueCredentialRouteProp } from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

const CredentialAcceptProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const route = useRoute<IssueCredentialRouteProp<'Processing'>>();
  const [state, setState] = useState<
    | LoadingResultState.InProgress
    | LoadingResultState.Success
    | LoadingResultState.Failure
  >(LoadingResultState.InProgress);
  const { credentialId, interactionId } = route.params;
  const { mutateAsync: acceptCredential } = useCredentialAccept();
  const { data: credential, refetch: refetchCredential } =
    useCredentialDetail(credentialId);

  useBlockOSBackNavigation();

  const handleCredentialAccept = useCallback(async () => {
    try {
      await acceptCredential(interactionId);
      await refetchCredential();
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Accept credential failure');
      setState(LoadingResultState.Failure);
    }
  }, [acceptCredential, interactionId, refetchCredential]);

  useEffect(() => {
    handleCredentialAccept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCTA = useCallback(() => {
    credential?.redirectUri &&
      Linking.openURL(credential.redirectUri).catch((e) => {
        reportException(e, "Couldn't open redirect URI");
      });
  }, [credential]);

  const onClose = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      ctaButtonLabel={translate('credentialAccept.success.cta')}
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onCTA={credential?.redirectUri ? onCTA : undefined}
      onClose={onClose}
      state={state}
      subtitle={translate(`credentialAccept.${state}.subtitle`)}
      successCloseButtonLabel={translate('common.close')}
      testID="CredentialAcceptProcessScreen"
      title={translate(`credentialAccept.${state}.title`)}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default CredentialAcceptProcessScreen;
