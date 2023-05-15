import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';

const ProofProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'ShareCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'Processing'>>();

  const {
    walletStore: { credentialShared },
  } = useStores();

  useBlockOSBackNavigation();

  const [state, setState] = useState(LoadingResultState.InProgress);
  useEffect(() => {
    setTimeout(() => setState(LoadingResultState.Success), 1000);
  }, []);

  const onConfirm = useCallback(() => {
    credentialShared(route.params.credentialId);
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [credentialShared, rootNavigation, route]);

  return (
    <LoadingResult
      variation={LoadingResultVariation.Neutral}
      state={state}
      title={translate(`proofRequest.process.${state}.title`)}
      subtitle={translate(`proofRequest.process.${state}.subtitle`)}
      onClose={onConfirm}
      successCloseButtonLabel={translate('proofRequest.process.success.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      failureCloseButtonLabel={translate('common.close')}
    />
  );
};

export default ProofProcessScreen;
