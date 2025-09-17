import {
  ButtonType,
  LoaderViewState,
  reportException,
  useBlockOSBackNavigation,
  useCredentialDetail,
  useProofAccept,
  useProofDetail,
} from '@procivis/one-react-native-components';
import { Ubiqu, WalletStorageType } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Linking } from 'react-native';

import { ProcessingView } from '../../components/common/processing-view';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';
import { isRSELockedError } from '../../utils/rse';

const { addEventListener: addRSEEventListener, PinEventType } = Ubiqu;

const ProofProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const route = useRoute<ShareCredentialRouteProp<'Processing'>>();
  const { credentials, interactionId, proofId } = route.params;
  const [state, setState] = useState<LoaderViewState>(
    LoaderViewState.InProgress,
  );
  const { mutateAsync: acceptProof } = useProofAccept();
  const { data: proof } = useProofDetail(proofId);
  const { walletStore } = useStores();
  const [error, setError] = useState<unknown>();

  useBlockOSBackNavigation();

  // ONE-2078: workaround for selecting matching did
  const { data: credentialDetail } = useCredentialDetail(
    Object.values(credentials)[0]?.credentialId,
  );
  const usedIdentifierId = useMemo(() => {
    if (!credentialDetail) {
      return undefined;
    }
    switch (credentialDetail.schema.walletStorageType) {
      case WalletStorageType.SOFTWARE:
        return walletStore.holderSwIdentifierId;
      case WalletStorageType.HARDWARE:
        return walletStore.holderHwIdentifierId;
      case WalletStorageType.REMOTE_SECURE_ELEMENT:
        return walletStore.holderRseIdentifierId;
      default:
        return walletStore.holderIdentifierId;
    }
  }, [walletStore, credentialDetail]);

  useEffect(() => {
    return addRSEEventListener((event) => {
      if (event.type === PinEventType.SHOW_PIN) {
        rootNavigation.navigate('RSESign');
      }
    });
  }, [rootNavigation]);

  const loaderLabel = useMemo(() => {
    if (error && isRSELockedError(error)) {
      return translate('info.proofRequest.process.error.rseLocked.title');
    }
    return translateError(
      error,
      translate(`proofRequestProcessTitle.${state}`),
    );
  }, [error, state]);

  const handleProofSubmit = useCallback(
    async (identifierId: string) => {
      try {
        await acceptProof({
          credentials,
          identifierId,
          interactionId,
        });
        setState(LoaderViewState.Success);
      } catch (e) {
        if (isRSELockedError(e)) {
          setState(LoaderViewState.Error);
        } else {
          setState(LoaderViewState.Warning);
        }
        setError(e);
      }
    },
    [acceptProof, credentials, interactionId],
  );

  useEffect(() => {
    if (usedIdentifierId) {
      handleProofSubmit(usedIdentifierId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!usedIdentifierId]);

  const redirectUri = proof?.redirectUri;
  const closeButtonHandler = useCallback(() => {
    const close = () => rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
    if (redirectUri) {
      Linking.openURL(redirectUri)
        .then(close)
        .catch((e) => {
          reportException(e, "Couldn't open redirect URI");
        });
    } else {
      close();
    }
  }, [redirectUri, rootNavigation]);

  return (
    <ProcessingView
      button={
        state === LoaderViewState.Success && redirectUri
          ? {
              onPress: closeButtonHandler,
              testID: 'ProofRequestAcceptProcessScreen.redirect',
              title: translate('common.backToService'),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      error={error}
      loaderLabel={loaderLabel}
      onClose={closeButtonHandler}
      state={state}
      testID="ProofRequestAcceptProcessScreen"
      title={translate('common.shareCredential')}
    />
  );
};

export default ProofProcessScreen;
