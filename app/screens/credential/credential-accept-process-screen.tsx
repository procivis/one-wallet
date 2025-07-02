import {
  ButtonType,
  LoaderViewState,
  reportException,
  useBlockOSBackNavigation,
  useCredentialAccept,
  useCredentialDetail,
} from '@procivis/one-react-native-components';
import {
  OneError,
  Ubiqu,
  WalletStorageType,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Linking, Platform } from 'react-native';

import { ProcessingView } from '../../components/common/processing-view';
import { useCreateRSE } from '../../hooks/rse';
import { translate, translateError, TxKeyPath } from '../../i18n';
import { useStores } from '../../models';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { isRSELockedError } from '../../utils/rse';

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
  const [state, setState] = useState<LoaderViewState>(
    LoaderViewState.InProgress,
  );
  const { credentialId, interactionId, txCode, txCodeValue } = route.params;
  const { mutateAsync: acceptCredential } = useCredentialAccept();
  const { data: credential, isLoading } = useCredentialDetail(credentialId);
  const { walletStore } = useStores();
  const [error, setError] = useState<unknown>();
  const { generateRSE } = useCreateRSE();
  const [acceptanceInitialized, setAcceptanceInitialized] = useState(false);
  const [rseInitialized, setRseInitialized] = useState(false);
  const [createdRseIdentifierId, setCreatedRseIdentifierId] =
    useState<string>();

  const requiredStorageType = credential?.schema.walletStorageType;
  const identifierId = useMemo(() => {
    switch (requiredStorageType) {
      case WalletStorageType.SOFTWARE:
        return walletStore.holderSwIdentifierId;
      case WalletStorageType.HARDWARE:
        return walletStore.holderHwIdentifierId;
      case WalletStorageType.REMOTE_SECURE_ELEMENT:
        return createdRseIdentifierId ?? walletStore.holderRseIdentifierId;
      default:
        return walletStore.holderIdentifierId;
    }
  }, [walletStore, requiredStorageType, createdRseIdentifierId]);

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
  }, [navigation, rootNavigation, walletStore.holderRseIdentifierId]);

  const loaderLabel = useMemo(() => {
    if (
      !error &&
      !identifierId &&
      requiredStorageType === WalletStorageType.REMOTE_SECURE_ELEMENT
    ) {
      return translate('credentialOffer.process.creatingRSE.title');
    } else if (error && isRSELockedError(error)) {
      return translate('credentialOffer.process.error.rseLocked.title');
    }
    const txKeyPath: TxKeyPath =
      state === LoaderViewState.Warning && !identifierId
        ? 'credentialOffer.process.warning.incompatible.title'
        : `credentialOffer.process.${state}.title`;
    return translateError(error, translate(txKeyPath));
  }, [error, identifierId, requiredStorageType, state]);

  const initializeRSE = useCallback(() => {
    if (rseInitialized) {
      return;
    }
    setRseInitialized(true);
    generateRSE()
      .then(setCreatedRseIdentifierId)
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
        identifierId,
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

      setError(e);
      if (isRSELockedError(e)) {
        setState(LoaderViewState.Error);
      } else {
        setState(LoaderViewState.Warning);
      }
    }
  }, [
    acceptanceInitialized,
    identifierId,
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
    if (!identifierId) {
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
    identifierId,
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

  const androidBackHandler = useCallback(() => {
    closeButtonHandler();
    return false;
  }, [closeButtonHandler]);
  useBlockOSBackNavigation(Platform.OS === 'ios', androidBackHandler);

  return (
    <ProcessingView
      button={
        state === LoaderViewState.Success && !isLoading && redirectUri
          ? {
              onPress: closeButtonHandler,
              testID: 'CredentialAcceptProcessScreen.redirect',
              title: translate('credentialOffer.redirect'),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      error={error}
      loaderLabel={loaderLabel}
      onClose={closeButtonHandler}
      state={state}
      testID="CredentialAcceptProcessScreen"
      title={translate('credentialOffer.title')}
    />
  );
});

export default CredentialAcceptProcessScreen;
