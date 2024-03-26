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

import {
  useCredentialAccept,
  useCredentialDetail,
} from '../../hooks/core/credentials';
import { translate, TxKeyPath } from '../../i18n';
import { useStores } from '../../models';
import { IssueCredentialRouteProp } from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
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
  const { data: credential } = useCredentialDetail(credentialId);
  const { walletStore } = useStores();

  useBlockOSBackNavigation();

  const requiredStorageType = credential?.schema.walletStorageType;
  const didId = useMemo(() => {
    switch (requiredStorageType) {
      case WalletStorageType.SOFTWARE:
        return walletStore.holderDidSwId;
      case WalletStorageType.HARDWARE:
        return walletStore.holderDidHwId;
      default:
        return walletStore.holderDidId;
    }
  }, [walletStore, requiredStorageType]);

  const handleCredentialAccept = useCallback(async () => {
    if (!didId) {
      setState(LoadingResultState.Failure);
      return;
    }

    try {
      await acceptCredential({ didId, interactionId });
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Accept credential failure');
      setState(LoadingResultState.Failure);
    }
  }, [acceptCredential, interactionId, didId]);

  useEffect(() => {
    if (credential) {
      handleCredentialAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!credential]);

  const redirectUri = credential?.redirectUri;
  const onCTA = useCallback(() => {
    redirectUri &&
      Linking.openURL(redirectUri).catch((e) => {
        reportException(e, "Couldn't open redirect URI");
      });
  }, [redirectUri]);

  const onClose = useCallback(() => {
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  const subtitle: TxKeyPath =
    state === LoadingResultState.Failure && !didId
      ? 'credentialAccept.failure.incompatible'
      : `credentialAccept.${state}.subtitle`;

  return (
    <LoadingResult
      ctaButtonLabel={translate('credentialAccept.success.cta')}
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onCTA={redirectUri ? onCTA : undefined}
      onClose={onClose}
      state={state}
      subtitle={translate(subtitle)}
      successCloseButtonLabel={translate('common.close')}
      testID="CredentialAcceptProcessScreen"
      title={translate(`credentialAccept.${state}.title`)}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default CredentialAcceptProcessScreen;
