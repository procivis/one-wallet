import {
  concatTestID,
  HeaderBackButton,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import parseUrl from 'parse-url';
import React, { FC, useCallback, useMemo } from 'react';
import { WebViewNavigation } from 'react-native-webview';

import WebViewScreen from '../../components/webview/webview-screen';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import {
  WalletUnitRegistrationNavigationProp,
  WalletUnitRegistrationRouteProp,
} from '../../navigators/wallet-unit-registration/wallet-unit-registration-routes';

const WalletUnitLoginScreen: FC = () => {
  const route = useRoute<WalletUnitRegistrationRouteProp<'Info'>>();
  const navigation =
    useNavigation<WalletUnitRegistrationNavigationProp<'Info'>>();
  const colorScheme = useAppColorScheme();
  const {
    walletStore: {
      walletProvider: { userAuthentication },
    },
  } = useStores();

  const onNavigationStateChange = useCallback(
    (event: WebViewNavigation) => {
      if (
        !userAuthentication?.redirectUri ||
        !event.url.startsWith(userAuthentication.redirectUri)
      ) {
        return;
      }
      let parsedUrl: parseUrl.ParsedUrl;
      try {
        parsedUrl = parseUrl(event.url);
      } catch {
        return [];
      }
      const code = parsedUrl.query.code;
      if (!code) {
        return;
      }
      navigation.navigate('Registration', {
        ...route.params,
        code,
      });
    },
    [navigation, route.params, userAuthentication?.redirectUri],
  );

  const testID = 'WalletUnitLoginScreen';

  const url = useMemo(() => {
    if (!userAuthentication) {
      return '';
    }
    const url = new URL(userAuthentication?.identityProvider ?? '');
    url.searchParams.set('client_id', userAuthentication?.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', userAuthentication?.redirectUri);
    return url.href;
  }, [userAuthentication]);

  return (
    <WebViewScreen
      header={{
        backgroundColor: colorScheme.white,
        leftItem: (
          <HeaderBackButton testID={concatTestID(testID, 'header.back')} />
        ),
        modalHandleVisible: true,
        title:
          userAuthentication?.identityProvider ??
          translate('common.walletActivation'),
      }}
      modalPresentation={true}
      onNavigationStateChange={onNavigationStateChange}
      style={{ backgroundColor: colorScheme.white }}
      testID={testID}
      uri={url}
    />
  );
};

export default WalletUnitLoginScreen;
