import {
  reportException,
  useONECore,
} from '@procivis/one-react-native-components';
import { types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import { closeBrowser, openBrowser } from '@swan-io/react-native-browser';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { readFile } from 'react-native-fs';

import { config } from '../../../config';
import useDocumentPicker from '../../../hooks/document-picker';
import { RootNavigationProp } from '../../../navigators/root/root-routes';

interface UseProviderAuthProps {
  provider: string;
}

const useProviderAuth = ({ provider }: UseProviderAuthProps) => {
  const { core } = useONECore();
  const [codeVerifier, setCodeVerifier] = useState<string>();
  const [document, setDocument] = useState<string>();
  const [documentName, setDocumentName] = useState<string>();
  const navigation = useNavigation<RootNavigationProp>();

  const { pickDocument } = useDocumentPicker({
    pickOptions: { type: types.pdf },
  });

  const handleDocumentSigning = useCallback(
    (code: string | null) => {
      if (code) {
        return navigation.navigate('SignDocument', {
          params: {
            code,
            codeVerifier,
            document,
            documentName,
            provider,
          },
          screen: 'WalletCentricProcessScreen',
        });
      }
      navigation.navigate('SignDocument', {
        screen: 'WalletCentricSignErrorScreen',
      });
    },
    [navigation, codeVerifier, document, documentName, provider],
  );

  const handleProviderAuth = useCallback(
    ({ url }: { url: string }) => {
      if (
        config.signDocumentRedirectUri &&
        url.startsWith(config.signDocumentRedirectUri)
      ) {
        const params = new URL(url).searchParams;
        const authCode = params.get('code');
        closeBrowser();
        handleDocumentSigning(authCode);
      }
    },
    [handleDocumentSigning],
  );

  const getAuthorization = useCallback(
    async (document: string) => {
      try {
        const res = await core.qesAuthorize({
          document,
          provider,
          redirectUri: config.signDocumentRedirectUri,
        });
        return res;
      } catch (err) {
        reportException(err, 'qesAuthorize failed');
        return null;
      }
    },
    [core, provider],
  );

  const login = useCallback(
    async ({
      documentPath,
      documentName,
    }: {
      documentName?: string;
      documentPath?: string;
    }) => {
      if (!documentPath) {
        return;
      }

      const documentBase64 = await readFile(documentPath, 'base64');
      setDocument(documentBase64);
      setDocumentName(documentName);
      const authorization = await getAuthorization(documentBase64);
      if (!authorization) {
        return;
      }
      setCodeVerifier(authorization.codeVerifier);
      try {
        await openBrowser(authorization.authorizationUrl);
      } catch (err) {
        reportException(err, 'Provider sign in failed');
      }
    },
    [getAuthorization],
  );

  const handleWalletCentricAuthorization = useCallback(async () => {
    const { documentPath, document } = await pickDocument();
    const strippedName = document?.name?.split('.')[0];

    await login({ documentName: strippedName, documentPath });
  }, [login, pickDocument]);

  useEffect(() => {
    const subscription = Linking.addListener('url', handleProviderAuth);
    return () => subscription.remove();
  }, [handleProviderAuth]);

  return { handleWalletCentricAuthorization };
};

export default useProviderAuth;
