import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
} from '@procivis/one-react-native-components';
import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import { WalletStorageType } from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Linking } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useProofAccept, useProofDetail } from '../../hooks/core/proofs';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';
import { reportException } from '../../utils/reporting';

const ProofProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const route = useRoute<ShareCredentialRouteProp<'Processing'>>();
  const isFocused = useIsFocused();
  const { credentials, interactionId, proofId } = route.params;
  const [closeTimeout, setCloseTimeout] = useState(5);
  const [state, setState] = useState(LoaderViewState.InProgress);
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
    setTimeout(async () => {
      try {
        await acceptProof({
          credentials,
          didId: didId!,
          interactionId,
        });
        setState(LoaderViewState.Success);
      } catch (e) {
        reportException(e, 'Submit Proof failure');
        setState(LoaderViewState.Warning);
      }
    }, 1000);
  }, [acceptProof, didId, credentials, interactionId]);

  useEffect(() => {
    if (didId) {
      handleProofSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!didId]);

  const redirectUri = proof?.redirectUri;
  const closeButtonHandler = useCallback(() => {
    if (redirectUri) {
      Linking.openURL(redirectUri).catch((e) => {
        reportException(e, "Couldn't open redirect URI");
      });
      return;
    }
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [redirectUri, rootNavigation]);

  useEffect(() => {
    if (state !== LoaderViewState.Success) {
      return;
    }
    if (closeTimeout === 0) {
      closeButtonHandler();
      return;
    }
    const timeout = setTimeout(() => {
      setCloseTimeout(closeTimeout - 1);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [closeButtonHandler, closeTimeout, state]);

  return (
    <LoadingResultScreen
      button={
        state === LoaderViewState.Success
          ? {
              onPress: closeButtonHandler,
              testID: 'ProofRequestAcceptProcessScreen.close',
              title: translate('proofRequest.process.success.cta', {
                timeout: closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      header={{
        leftItem: HeaderCloseModalButton,
        modalHandleVisible: true,
        title: translate('proofRequest.title'),
      }}
      loader={{
        animate: isFocused,
        label: translate(`proofRequest.process.${state}.title`),
        state,
      }}
      testID="ProofRequestAcceptProcessScreen"
    />
  );
};

export default ProofProcessScreen;
