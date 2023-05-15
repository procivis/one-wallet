import { formatDate, QRCodeScanner } from '@procivis/react-native-components';
import { useIsFocused } from '@react-navigation/core';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BarCodeReadEvent } from 'react-native-camera';

import { translate } from '../../i18n';
import { NewCredential } from '../../models/wallet-store/wallet-store-models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { ProofRequest } from '../../navigators/share-credential/share-credential-routes';

const QRCodeScannerScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'Tabs'>>();
  const isFocused = useIsFocused();
  const [code, setCode] = useState<string>();

  const handleCodeScan = useCallback(
    (event: BarCodeReadEvent) => {
      if (code) {
        return;
      }
      setCode(event.data);
    },
    [code, setCode],
  );

  const issueCredential = useCallback(() => {
    // add dummy credential
    const credential: NewCredential = {
      schema: 'Driving License',
      issuer: 'did:key:Bbcox5wNDwShXZrt7r5ZS1:2',
      format: 'mDL',
      revocation: 'mDL',
      transport: 'OpenID4VC',
      attributes: [
        { key: 'surname', value: 'Caduff' },
        { key: 'firstName', value: 'Lars' },
        { key: 'dateOfBirth', value: formatDate(new Date(631580400)) ?? '' },
      ],
      log: [],
    };
    navigation.navigate('IssueCredential', { screen: 'CredentialOffer', params: { credential } });
  }, [navigation]);

  const shareCredential = useCallback(() => {
    // dummy proof request
    const request: ProofRequest = {
      credentialSchema: 'Driving License',
      verifier: 'did:key:zDnaerDaTF5BXEavCrfR',
      credentialFormat: 'mDL',
      revocationMethod: 'mDL',
      transport: 'OpenID4VC',
      attributes: [
        { key: 'surname', mandatory: true },
        { key: 'firstName', mandatory: true },
        { key: 'dateOfBirth', mandatory: false },
      ],
    };
    navigation.navigate('ShareCredential', { screen: 'ProofRequest', params: { request } });
  }, [navigation]);

  useEffect(() => {
    if (!code) {
      return;
    }

    // dummy logic: if content starts with share, run sharing flow, otherwise issuing flow
    if (code.startsWith('share')) {
      shareCredential();
    } else {
      issueCredential();
    }
  }, [code, issueCredential, shareCredential]);

  return (
    <View style={styles.screen}>
      {isFocused && (
        <QRCodeScanner
          onBarCodeRead={handleCodeScan}
          title={translate('wallet.qrCodeScannerScreen.title')}
          description={translate('wallet.qrCodeScannerScreen.description')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  screen: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
  },
});

export default QRCodeScannerScreen;
