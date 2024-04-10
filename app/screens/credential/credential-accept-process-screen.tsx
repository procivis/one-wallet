import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
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

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
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
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const route = useRoute<IssueCredentialRouteProp<'Processing'>>();
  const isFocused = useIsFocused();
  const [closeTimeout, setCloseTimeout] = useState(5);
  const [state, setState] = useState(LoaderViewState.InProgress);
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

  const loaderLabel = useMemo(() => {
    const txKeyPath: TxKeyPath =
      state === LoaderViewState.Warning && !didId
        ? 'credentialOffer.process.warning.incompatible.title'
        : `credentialOffer.process.${state}.title`;
    return translate(txKeyPath);
  }, [didId, state]);

  const handleCredentialAccept = useCallback(() => {
    setTimeout(async () => {
      if (!didId) {
        setState(LoaderViewState.Warning);
        return;
      }

      try {
        await acceptCredential({ didId, interactionId });
        setState(LoaderViewState.Success);
      } catch (e) {
        reportException(e, 'Accept credential failure');
        setState(LoaderViewState.Warning);
      }
    }, 1000);
  }, [acceptCredential, interactionId, didId]);

  useEffect(() => {
    if (credential) {
      handleCredentialAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!credential]);

  const redirectUri = credential?.redirectUri;
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
              testID: 'CredentialAcceptProcessScreen.close',
              title: translate('credentialOffer.process.success.cta', {
                timeout: closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      header={{
        leftItem: HeaderCloseModalButton,
        modalHandleVisible: true,
        title: translate('credentialOffer.title'),
      }}
      loader={{
        animate: isFocused,
        label: loaderLabel,
        state,
        testID: 'CredentialAcceptProcessScreen.animation',
      }}
      testID="CredentialAcceptProcessScreen"
    />
  );
};

export default CredentialAcceptProcessScreen;
