import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  reportException,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useCredentialAccept,
  useCredentialDetail,
} from '@procivis/one-react-native-components';
import { OneError, WalletStorageType } from '@procivis/react-native-one-core';
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
import { Linking, Platform } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { translate, translateError, TxKeyPath } from '../../i18n';
import { useStores } from '../../models';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const invalidCodeBRs = ['BR_0169', 'BR_0170'];

const CredentialAcceptProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'Processing'>>();
  const isFocused = useIsFocused();
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const { credentialId, interactionId, txCode, txCodeValue } = route.params;
  const { mutateAsync: acceptCredential } = useCredentialAccept();
  const { data: credential, isLoading } = useCredentialDetail(credentialId);
  const { walletStore } = useStores();
  const [error, setError] = useState<unknown>();

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
    return translateError(error, translate(txKeyPath));
  }, [didId, state, error]);

  const handleCredentialAccept = useCallback(async () => {
    if (!didId) {
      setState(LoaderViewState.Warning);
      return;
    }

    try {
      await acceptCredential({
        didId,
        interactionId,
        txCode: txCodeValue,
      });
      setState(LoaderViewState.Success);
    } catch (e) {
      if (e instanceof OneError && invalidCodeBRs.includes(e.code)) {
        return navigation.replace('CredentialConfirmationCode', {
          credentialId,
          interactionId,
          invalidCode: txCodeValue,
          txCode: txCode!,
        });
      }

      setState(LoaderViewState.Warning);
      setError(e);
    }
  }, [
    didId,
    acceptCredential,
    interactionId,
    txCodeValue,
    navigation,
    credentialId,
    txCode,
  ]);

  useEffect(() => {
    if (credential) {
      handleCredentialAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!credential]);

  const redirectUri = credential?.redirectUri;
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

  const androidBackHandler = useCallback(() => {
    closeButtonHandler();
    return false;
  }, [closeButtonHandler]);
  useBlockOSBackNavigation(Platform.OS === 'ios', androidBackHandler);

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
        state === LoaderViewState.Success && !isLoading
          ? {
              onPress: closeButtonHandler,
              testID: `CredentialAcceptProcessScreen.${
                redirectUri ? 'redirect' : 'close'
              }`,
              title: redirectUri
                ? translate('credentialOffer.redirect')
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
          state === LoaderViewState.Warning && error ? (
            <HeaderInfoButton onPress={infoPressHandler} />
          ) : undefined,
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
