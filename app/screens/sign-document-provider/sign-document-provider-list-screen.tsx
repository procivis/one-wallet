import {
  Button,
  ButtonType,
  concatTestID,
  HeaderBackButton,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { DocumentSigner } from '../../models/wallet-store/wallet-store';
import SignDocumentProviderListItem from './sign-document-provider-list-item';
import useWalletCentricProviderAuth from './wallet-centric/use-provider-auth';

const testID = 'SignDocumentProviderListScreen';

const SignDocumentProviderListScreen = () => {
  const colorScheme = useAppColorScheme();
  const {
    walletStore: {
      walletProvider: { documentSigners },
    },
  } = useStores();
  const [selectedProvider, setSelectedProvider] = useState(documentSigners[0]);
  const { handleWalletCentricAuthorization } = useWalletCentricProviderAuth({
    provider: selectedProvider.name,
  });

  const handlePress = useCallback(
    (provider: DocumentSigner) => () => {
      setSelectedProvider(provider);
    },
    [],
  );

  const handleContinue = useCallback(() => {
    if (selectedProvider.type === 'WALLET_CENTRIC') {
      handleWalletCentricAuthorization();
    }
  }, [handleWalletCentricAuthorization, selectedProvider]);

  return (
    <>
      <ScrollViewScreen
        header={{
          leftItem: (
            <HeaderBackButton testID={concatTestID(testID, 'header.back')} />
          ),
          title: translate('common.signDocument'),
        }}
        style={[styles.screen, { backgroundColor: colorScheme.white }]}
        testID={testID}
      >
        <View style={styles.content}>
          <Typography color={colorScheme.text} style={styles.subtitle}>
            {translate('info.signDocument.description')}
          </Typography>
          {documentSigners.map((provider) => (
            <SignDocumentProviderListItem
              isSelected={selectedProvider.name === provider.name}
              key={provider.name}
              onPress={handlePress(provider)}
              provider={provider}
            />
          ))}
        </View>
        <Button
          onPress={handleContinue}
          style={styles.button}
          testID={concatTestID(testID, 'continue')}
          title={translate('common.continue')}
          type={ButtonType.Primary}
        />
      </ScrollViewScreen>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  screen: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
});
export default memo(SignDocumentProviderListScreen);
