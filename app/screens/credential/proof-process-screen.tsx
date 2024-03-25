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

import { useProofAccept, useProofDetail } from '../../hooks/proofs';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';
import { reportException } from '../../utils/reporting';

const ProofProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'ShareCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'Processing'>>();
  const { credentials, interactionId, proofId } = route.params;
  const [state, setState] = useState(LoadingResultState.InProgress);
  const { mutateAsync: acceptProof } = useProofAccept();
  const { data: proof, refetch: refetchProof } = useProofDetail(proofId);
  const { walletStore } = useStores();

  useBlockOSBackNavigation();

  const handleProofSubmit = useCallback(async () => {
    try {
      await acceptProof({
        credentials,
        didId: walletStore.holderDidId,
        interactionId,
      });
      await refetchProof();
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Submit Proof failure');
      setState(LoadingResultState.Failure);
    }
  }, [acceptProof, credentials, interactionId, refetchProof, walletStore]);

  useEffect(() => {
    handleProofSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCTA = useCallback(() => {
    proof?.redirectUri &&
      Linking.openURL(proof.redirectUri).catch((e) => {
        reportException(e, "Couldn't open redirect URI");
      });
  }, [proof]);

  const onClose = useCallback(() => {
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      ctaButtonLabel={translate('proofRequest.process.success.cta')}
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onCTA={proof?.redirectUri ? onCTA : undefined}
      onClose={onClose}
      state={state}
      subtitle={translate(`proofRequest.process.${state}.subtitle`)}
      successCloseButtonLabel={translate('common.close')}
      testID="ProofRequestAcceptProcessScreen"
      title={translate(`proofRequest.process.${state}.title`)}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default ProofProcessScreen;
