import {
  BackButton,
  concatTestID,
  ScrollViewScreen,
  useAppColorScheme,
  useContinueIssuance,
  useInitiateIssuance,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import { closeBrowser, openBrowser } from '@swan-io/react-native-browser';
import { omit } from 'lodash';
import React, { memo, useCallback, useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { assets, config } from '../../config';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import RequestCredentialListItem from './request-credential-list-item';

export interface RequestCredentialItem {
  authorizationDetails?: {
    credentialConfigurationId: string;
    type: string;
  }[];
  clientId: string;
  issuer: string;
  logo: string;
  name: string;
  protocol: string;
  scope?: string[];
}

const RequestCredentialListScreen = () => {
  const { credentialsIssuers = [] } = assets;
  const rootNavigation = useNavigation<RootNavigationProp>();
  const colorScheme = useAppColorScheme();
  const { mutateAsync: initiateIssuance } = useInitiateIssuance();
  const { mutateAsync: continueIssuance } = useContinueIssuance();

  const handleInitiateIssuance = useCallback(
    async (credential: RequestCredentialItem) => {
      const issuanceRequestParams = {
        redirectUri: config.requestCredentialRedirectUri,
        ...omit(credential, ['logo', 'name']),
      };
      const { url } = await initiateIssuance(issuanceRequestParams);
      await openBrowser(url);
    },
    [initiateIssuance],
  );

  const handleClick = useCallback(
    (credential: RequestCredentialItem) => () => {
      handleInitiateIssuance(credential);
    },
    [handleInitiateIssuance],
  );

  const handleContinueIssuance = useCallback(
    async (url: string) => {
      if (
        config.requestCredentialRedirectUri &&
        url.startsWith(config.requestCredentialRedirectUri)
      ) {
        closeBrowser();
        const result = await continueIssuance(url);
        rootNavigation.navigate('CredentialManagement', {
          params: {
            params: {
              credentialId: result.credentialIds[0],
              interactionId: result.interactionId,
            },
            screen: 'CredentialOffer',
          },
          screen: 'IssueCredential',
        });
      }
    },
    [continueIssuance, rootNavigation],
  );

  useEffect(() => {
    const subscription = Linking.addListener(
      'url',
      ({ url }: { url: string }) => {
        handleContinueIssuance(url);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [handleContinueIssuance]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <BackButton onPress={rootNavigation.goBack} testID={'back'} />
        ),
        title: translate('common.issueDocument'),
      }}
      scrollView={{
        testID: 'scroll',
      }}
      style={{ backgroundColor: colorScheme.background }}
      testID="RequestCredentialListScreen"
    >
      <View style={styles.wrapper}>
        {credentialsIssuers.map((credentialIssuer) => (
          <RequestCredentialListItem
            credentialDetailPrimary={credentialIssuer.issuer}
            credentialName={credentialIssuer.name}
            handleClick={handleClick(credentialIssuer)}
            icon={{
              imageSource: { uri: credentialIssuer.logo },
            }}
            key={credentialIssuer.name}
            testID={concatTestID(
              'RequestCredentialListScreen.issuer',
              credentialIssuer.name,
            )}
          />
        ))}
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
});
export default memo(RequestCredentialListScreen);
