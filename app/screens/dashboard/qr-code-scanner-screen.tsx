import { QRCodeScannerScreen as ScannerScreenComponent } from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { Code } from 'react-native-vision-camera';

import { useCameraPermission } from '../../hooks/camera-permissions';
import { useInvitationHandling } from '../../hooks/core/deep-link';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';

const QRCodeScannerScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeScanner'>>();
  const [code, setCode] = useState<string>();
  const { cameraPermission } = useCameraPermission();

  const handleCodeScan = useCallback(
    (scannedCode: Code[]) => {
      if (!code) {
        setCode(scannedCode[0].value);
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

  useEffect(() => {
    if (cameraPermission === 'blocked') {
      Alert.alert(
        translate('wallet.qrCodeScannerScreen.permissions.camera.title'),
        translate('wallet.qrCodeScannerScreen.permissions.camera.description'),
        [
          {
            onPress: navigation.goBack,
            text: translate('common.cancel'),
          },
          {
            onPress: openSettings,
            text: translate('common.openSettings'),
          },
        ],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPermission]);

  return (
    <View style={styles.screen}>
      {isFocused && (
        <ScannerScreenComponent
          onClose={navigation.goBack}
          onQRCodeRead={handleCodeScan}
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
