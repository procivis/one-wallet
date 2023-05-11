import { formatDate, QRCodeScanner } from '@procivis/react-native-components';
import { useIsFocused } from '@react-navigation/core';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BarCodeReadEvent } from 'react-native-camera';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { LogAction } from '../../models/wallet-store/wallet-store-models';
import { TabsNavigationProp } from '../../navigators/root/tabs/tabs-routes';

const QRCodeScannerScreen: FunctionComponent = () => {
  const navigation = useNavigation<TabsNavigationProp<'QRCodeScanner'>>();
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

  const { walletStore } = useStores();

  useEffect(() => {
    if (!code) {
      return;
    }

    // add dummy credential
    walletStore.credentialAdded({
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
      log: [{ action: LogAction.Issue, date: new Date() }],
    });
    navigation.navigate('Wallet');
    setCode(undefined);
  }, [code, navigation, walletStore]);

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
