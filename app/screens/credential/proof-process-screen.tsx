import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  reportException,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useCredentialDetail,
  useProofAccept,
  useProofDetail,
} from '@procivis/one-react-native-components';
import { Ubiqu, WalletStorageType } from '@procivis/react-native-one-core';
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

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
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
  const isFocused = useIsFocused();
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
        return walletStore.holderDidSwId;
      case WalletStorageType.HARDWARE:
        return walletStore.holderDidHwId;
      case WalletStorageType.REMOTE_SECURE_ELEMENT:
        return walletStore.holderDidRseId;
      default:
        return walletStore.holderDidId;
    }
  }, [walletStore, credentialDetail]);

  useEffect(() => {
    return addRSEEventListener((event) => {
      switch (event.type) {
        case PinEventType.SHOW_PIN:
          rootNavigation.navigate('RSESign');
          break;
      }
    });
  }, [rootNavigation]);

  const loaderLabel = useMemo(() => {
    if (error && isRSELockedError(error)) {
      return translate('proofRequest.process.error.rseLocked.title');
    }
    return translateError(
      error,
      translate(`proofRequest.process.${state}.title`),
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
    const close = () =>
      rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
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
  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success && !redirectUri,
    closeButtonHandler,
  );

  const infoPressHandler = useCallback(() => {
    if (!error) {
      return;
    }
    rootNavigation.navigate('NerdMode', {
      params: { error },
      screen: 'ErrorNerdMode',
    });
  }, [error, rootNavigation]);

  return (
    <LoadingResultScreen
      button={
        state === LoaderViewState.Success
          ? {
              onPress: closeButtonHandler,
              testID: `ProofRequestAcceptProcessScreen.${
                redirectUri ? 'redirect' : 'close'
              }`,
              title: redirectUri
                ? translate('proofRequest.redirect')
                : translate('common.closeWithTimeout', {
                    timeout: closeTimeout,
                  }),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      header={{
        leftItem: (
          <HeaderCloseModalButton testID="ProofRequestAcceptProcessScreen.header.close" />
        ),
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID="ProofRequestAcceptProcessScreen.header.info"
            />
          ) : undefined,
        title: translate('proofRequest.title'),
      }}
      loader={{
        animate: isFocused,
        label: loaderLabel,
        state,
        testID: 'ProofRequestAcceptProcessScreen.animation',
      }}
      testID="ProofRequestAcceptProcessScreen"
    />
  );
};

export default ProofProcessScreen;
