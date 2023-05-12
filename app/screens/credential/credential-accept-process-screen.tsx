import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { LogAction } from '../../models/wallet-store/wallet-store-models';
import { IssueCredentialRouteProp } from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

const CredentialAcceptProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const route = useRoute<IssueCredentialRouteProp<'Processing'>>();

  const {
    walletStore: { credentialAdded },
  } = useStores();

  useBlockOSBackNavigation();

  const onConfirm = useCallback(() => {
    credentialAdded({ ...route.params.credential, log: [{ action: LogAction.Issue, date: new Date() }] });
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [credentialAdded, rootNavigation, route]);

  return (
    <LoadingResult
      variation={LoadingResultVariation.Neutral}
      state={LoadingResultState.Success}
      title={translate('credentialAccept.success.title')}
      subtitle={translate('credentialAccept.success.subtitle')}
      onClose={onConfirm}
      successCloseButtonLabel={translate('credentialAccept.success.close')}
      inProgressCloseButtonLabel="TODO"
      failureCloseButtonLabel="TODO"
    />
  );
};

export default CredentialAcceptProcessScreen;
