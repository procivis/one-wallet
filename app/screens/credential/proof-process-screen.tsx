import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { WalletStorageType } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Linking } from 'react-native';

import { useCredentialDetail } from '../../hooks/core/credentials';
import { useProofAccept, useProofDetail } from '../../hooks/core/proofs';
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
  const { data: proof } = useProofDetail(proofId);
  const { walletStore } = useStores();

  useBlockOSBackNavigation();

  // ONE-2078: workaround for selecting matching did
  const { data: credentialDetail } = useCredentialDetail(
    Object.values(credentials)[0]?.credentialId,
  );
  const didId = useMemo(() => {
    if (!credentialDetail) {
      return undefined;
    }
    switch (credentialDetail.schema.walletStorageType) {
      case WalletStorageType.SOFTWARE:
        return walletStore.holderDidSwId;
      case WalletStorageType.HARDWARE:
        return walletStore.holderDidHwId;
      default:
        return walletStore.holderDidId;
    }
  }, [walletStore, credentialDetail]);

  const handleProofSubmit = useCallback(async () => {
    try {
      await acceptProof({
        credentials,
        didId: didId!,
        interactionId,
      });
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Submit Proof failure');
      setState(LoadingResultState.Failure);
    }
  }, [acceptProof, didId, credentials, interactionId]);

  useEffect(() => {
    if (didId) {
      handleProofSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!didId]);

  const redirectUri = proof?.redirectUri;
  const onCTA = useCallback(() => {
    redirectUri &&
      Linking.openURL(redirectUri).catch((e) => {
        reportException(e, "Couldn't open redirect URI");
      });
  }, [redirectUri]);

  const onClose = useCallback(() => {
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      ctaButtonLabel={translate('proofRequest.process.success.cta')}
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onCTA={redirectUri ? onCTA : undefined}
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
