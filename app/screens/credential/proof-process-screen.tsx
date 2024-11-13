import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useCredentialDetail,
  useProofAccept,
  useProofDetail,
} from '@procivis/one-react-native-components';
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

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
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
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const { mutateAsync: acceptProof } = useProofAccept();
  const { data: proof } = useProofDetail(proofId);
  const { walletStore } = useStores();
  const [error, setError] = useState<unknown>();

  useBlockOSBackNavigation();

  // ONE-2078: workaround for selecting matching did
  const { data: credentialDetail } = useCredentialDetail(
    Object.values(credentials)[0]?.credentialId,
  );
  const usedDidId = useMemo(() => {
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

  const handleProofSubmit = useCallback(
    async (didId: string) => {
      try {
        await acceptProof({
          credentials,
          didId,
          interactionId,
        });
        setState(LoaderViewState.Success);
      } catch (e) {
        reportException(e, 'Submit Proof failure');
        setState(LoaderViewState.Warning);
        setError(e);
      }
    },
    [acceptProof, credentials, interactionId],
  );

  useEffect(() => {
    if (usedDidId) {
      handleProofSubmit(usedDidId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!usedDidId]);

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
        leftItem: HeaderCloseModalButton,
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton onPress={infoPressHandler} />
          ) : undefined,
        title: translate('proofRequest.title'),
      }}
      loader={{
        animate: isFocused,
        label: translate(`proofRequest.process.${state}.title`),
        state,
        testID: 'ProofRequestAcceptProcessScreen.animation',
      }}
      testID="ProofRequestAcceptProcessScreen"
    />
  );
};

export default ProofProcessScreen;
