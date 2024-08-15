import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { openSettings, RESULTS } from 'react-native-permissions';
import { Code } from 'react-native-vision-camera';

import { ScannerScreen } from '../../components/vision-camera/vision-camera';
import { useCameraPermission } from '../../hooks/camera-permissions';
import { useInvitationHandling } from '../../hooks/core/deep-link';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';

const QRCodeScannerScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeScanner'>>();
  const [code, setCode] = useState<string>();
  const { status: cameraPermissionStatus, request: requestCameraPermission } =
    useCameraPermission();

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
    if (cameraPermissionStatus === RESULTS.DENIED) {
      requestCameraPermission().then((result) => {
        if (result === RESULTS.DENIED) {
          // this case only happens on Android: If request is denied (but can be retried),
          // user is navigated back and the OS prompt will be repeated when coming back to this screen
          navigation.goBack();
        }
      });
    }
  }, [cameraPermissionStatus, navigation, requestCameraPermission]);

  useEffect(() => {
    if (cameraPermissionStatus === RESULTS.BLOCKED && isFocused) {
      Alert.alert(
        translate('wallet.qrCodeScannerScreen.permissions.camera.title'),
        translate('wallet.qrCodeScannerScreen.permissions.camera.description'),
        [
          {
            onPress: () => navigation.goBack(),
            text: translate('common.cancel'),
          },
          {
            onPress: () => openSettings(),
            text: translate('common.openSettings'),
          },
        ],
      );
    }
  }, [cameraPermissionStatus, navigation, isFocused]);

  return (
    <View style={styles.screen} testID="QRCodeScannerScreen">
      {cameraPermissionStatus === RESULTS.GRANTED && (
        <ScannerScreen
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

export default memo(QRCodeScannerScreen);
