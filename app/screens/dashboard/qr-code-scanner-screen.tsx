import { QRCodeScanner } from '@procivis/react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { BarCodeReadEvent } from 'react-native-camera';

import { useInvitationHandling } from '../../hooks/core/deep-link';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';

const QRCodeScannerScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeScanner'>>();
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
      navigation.goBack();
      handleInvitationUrl(code);
    }
  }, [code, navigation, handleInvitationUrl]);

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
