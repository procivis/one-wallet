import { QRCodeScanner } from '@procivis/react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BarCodeReadEvent } from 'react-native-camera';

import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

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

  useEffect(() => {
    if (!code) {
      return;
    }

    navigation.navigate('Invitation', { screen: 'Processing', params: { invitationUrl: code } });
  }, [code, navigation]);

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