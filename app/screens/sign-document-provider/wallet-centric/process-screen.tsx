import {
  ButtonType,
  concatTestID,
  HeaderCloseButton,
  HeaderInfoButton,
  LoaderViewState,
  LoadingResultScreen,
  reportException,
  useONECore,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { TemporaryDirectoryPath, writeFile } from 'react-native-fs';
import Share from 'react-native-share';

import { translate, translateError } from '../../../i18n';
import { RootNavigationProp } from '../../../navigators/root/root-routes';
import {
  SignDocumentNavigationProp,
  SignDocumentRouteProp,
} from '../../../navigators/sign-document/sign-document-routes';

const testID = 'SignDocumentProcessScreen';

const SignDocumentProcessScreen = () => {
  const { core } = useONECore();
  const [state, setState] = useState(LoaderViewState.InProgress);
  const [signedDocument, setSignedDocument] = useState<string>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const route = useRoute<SignDocumentRouteProp<'WalletCentricProcessScreen'>>();
  const { code, codeVerifier, document, provider, documentName } = route.params;

  const navigation =
    useNavigation<SignDocumentNavigationProp<'WalletCentricProcessScreen'>>();
  const error = '';

  const handleSign = useCallback(async () => {
    if (!codeVerifier || !document) {
      return;
    }

    try {
      setState(LoaderViewState.InProgress);
      const { signedDocument } = await core.qesSign({
        code,
        codeVerifier,
        document,
        provider,
      });
      setSignedDocument(signedDocument);
      setState(LoaderViewState.Success);
    } catch (err) {
      setState(LoaderViewState.Error);
      reportException(err, 'Document signing failed');
    }
  }, [code, codeVerifier, core, document, provider]);

  const infoPressHandler = useCallback(() => {
    rootNavigation.navigate('NerdMode', {
      params: { error },
      screen: 'ErrorNerdMode',
    });
  }, [error, rootNavigation]);

  const closeButtonHandler = useCallback(() => {
    rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  const loaderLabel = useMemo(() => {
    if (state === LoaderViewState.InProgress) {
      return translate('common.signing...');
    }
    if (state === LoaderViewState.Success) {
      return translate('common.documentSigned');
    }

    return translate('common.documentSigningFailed');
  }, [state]);

  const handleDocumentShare = useCallback(async () => {
    if (!signedDocument) return;

    try {
      const name = documentName ?? 'document';
      const filePath = `${TemporaryDirectoryPath}/${name}_signed.pdf`;
      await writeFile(filePath, signedDocument, 'base64');
      await Share.open({
        filename: `${name}_signed`,
        type: 'application/pdf',
        url: `file://${filePath}`,
      });

      navigation.navigate('WalletCentricSavedScreen');
    } catch (err) {
      reportException(err, 'Share canceled');
    }
  }, [documentName, navigation, signedDocument]);

  const handleSave = useCallback(() => {
    handleDocumentShare();
  }, [handleDocumentShare]);

  useEffect(() => {
    handleSign();
  }, [handleSign]);

  return (
    <LoadingResultScreen
      button={{
        onPress: handleSave,
        testID: concatTestID(testID, 'saveDocument'),
        title: translate('common.saveDocument'),
        type: ButtonType.Primary,
      }}
      header={{
        leftItem: (
          <HeaderCloseButton
            onPress={closeButtonHandler}
            testID={concatTestID(testID, 'header.close')}
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning && error ? (
            <HeaderInfoButton
              accessibilityLabel={translate('common.info')}
              onPress={infoPressHandler}
              testID={concatTestID(testID, 'header.info')}
            />
          ) : undefined,
        title: translate('common.saveDocument'),
      }}
      loader={{
        animate: false,
        label: translateError(error, loaderLabel),
        state,
        testID: concatTestID(testID, 'animation'),
      }}
      testID={testID}
    />
  );
};

export default memo(SignDocumentProcessScreen);
