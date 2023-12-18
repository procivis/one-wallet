import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { useONECore } from '../../hooks/core-context';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';
import { reportException } from '../../utils/reporting';

const ProofProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'ShareCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'Processing'>>();
  const { core } = useONECore();

  useBlockOSBackNavigation();

  const [state, setState] = useState(LoadingResultState.InProgress);
  useEffect(() => {
    core
      .holderSubmitProof(route.params.interactionId, route.params.credentials)
      .then(() => setState(LoadingResultState.Success))
      .catch((e) => {
        setState(LoadingResultState.Failure);
        reportException(e, 'Submit Proof failure');
      });
  }, [core, route]);

  const onClose = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      testID="ProofRequestAcceptProcessScreen"
      variation={LoadingResultVariation.Neutral}
      state={state}
      title={translate(`proofRequest.process.${state}.title`)}
      subtitle={translate(`proofRequest.process.${state}.subtitle`)}
      onClose={onClose}
      successCloseButtonLabel={translate('proofRequest.process.success.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      failureCloseButtonLabel={translate('common.close')}
    />
  );
};

export default ProofProcessScreen;
