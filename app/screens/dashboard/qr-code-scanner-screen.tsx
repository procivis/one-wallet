import { QRCodeScanner } from '@procivis/react-native-components';
import { useIsFocused } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { BarCodeReadEvent } from 'react-native-camera';

import { useInvitationHandling } from '../../hooks/deep-link';
import { translate } from '../../i18n';

const QRCodeScannerScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const [code, setCode] = useState<string>();

  const handleCodeScan = useCallback(
    (event: BarCodeReadEvent) => {
      if (!code) {
        setCode(event.data);
      }
    },
    [code, setCode],
  );

  const handleInvitationUrl = useInvitationHandling();
  useEffect(() => {
    if (code) {
      handleInvitationUrl(code);
    }
  }, [code, handleInvitationUrl]);

  return (
    <View style={styles.screen}>
      {isFocused && (
        <QRCodeScanner
          description={translate('wallet.qrCodeScannerScreen.description')}
          onBarCodeRead={handleCodeScan}
          title={translate('wallet.qrCodeScannerScreen.title')}
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
