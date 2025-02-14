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
import {
  OneError,
  Ubiqu,
  WalletStorageType,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
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
import { useCreateRSE } from '../../hooks/rse';
import { translate, translateError, TxKeyPath } from '../../i18n';
import { useStores } from '../../models';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const {
  addEventListener: addRSEEventListener,
  PinEventType,
  PinFlowType,
} = Ubiqu;

const invalidCodeBRs = ['BR_0169', 'BR_0170'];

const CredentialAcceptProcessScreen: FunctionComponent = observer(() => {
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
  const { generateRSE } = useCreateRSE();
  const [acceptanceInitialized, setAcceptanceInitialized] = useState(false);
  const [rseInitialized, setRseInitialized] = useState(false);
  const [createdRseDidId, setCreatedRseDidId] = useState<string>();

  const requiredStorageType = credential?.schema.walletStorageType;
  const didId = useMemo(() => {
    switch (requiredStorageType) {
      case WalletStorageType.SOFTWARE:
        return walletStore.holderDidSwId;
      case WalletStorageType.HARDWARE:
        return walletStore.holderDidHwId;
      case WalletStorageType.REMOTE_SECURE_ELEMENT:
        return createdRseDidId ?? walletStore.holderDidRseId;
      default:
        return walletStore.holderDidId;
    }
  }, [walletStore, requiredStorageType, createdRseDidId]);

  useEffect(() => {
    return addRSEEventListener((event) => {
      if (event.type !== PinEventType.SHOW_PIN) {
        return;
      }
      if (event.flowType === PinFlowType.TRANSACTION) {
        rootNavigation.navigate('RSESign');
      } else if (event.flowType === PinFlowType.SUBSCRIBE) {
        navigation.navigate('RSEPinSetup');
      } else if (event.flowType === PinFlowType.ADD_BIOMETRICS) {
        navigation.navigate('RSEAddBiometrics');
      }
    });
  }, [navigation, rootNavigation, walletStore.holderDidRseId]);

  const loaderLabel = useMemo(() => {
    if (
      !error &&
      !didId &&
      requiredStorageType === WalletStorageType.REMOTE_SECURE_ELEMENT
    ) {
      return translate('credentialOffer.process.creatingRSE.title');
    }
    const txKeyPath: TxKeyPath =
      state === LoaderViewState.Warning && !didId
        ? 'credentialOffer.process.warning.incompatible.title'
        : `credentialOffer.process.${state}.title`;
    return translateError(error, translate(txKeyPath));
  }, [error, didId, requiredStorageType, state]);

  const initializeRSE = useCallback(() => {
    if (rseInitialized) {
      return;
    }
    setRseInitialized(true);
    generateRSE()
      .then(setCreatedRseDidId)
      .catch((e) => {
        setState(LoaderViewState.Warning);
        setError(e);
      });
  }, [generateRSE, rseInitialized]);

  const handleCredentialAccept = useCallback(async () => {
    if (acceptanceInitialized) {
      return;
    }
    setAcceptanceInitialized(true);
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
    acceptanceInitialized,
    didId,
    acceptCredential,
    interactionId,
    txCodeValue,
    navigation,
    credentialId,
    txCode,
  ]);

  useEffect(() => {
    if (!credential) {
      return;
    }
    if (!didId) {
      if (requiredStorageType === WalletStorageType.REMOTE_SECURE_ELEMENT) {
        initializeRSE();
      } else {
        setState(LoaderViewState.Warning);
      }
      return;
    }
    handleCredentialAccept();
  }, [
    credential,
    didId,
    handleCredentialAccept,
    initializeRSE,
    requiredStorageType,
  ]);

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
        leftItem: (
          <HeaderCloseModalButton testID="CredentialAcceptProcessScreen.header.close" />
        ),
        rightItem:
          state === LoaderViewState.Warning && error ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID="CredentialAcceptProcessScreen.header.info"
            />
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
});

export default CredentialAcceptProcessScreen;
