import { QRCodeScannerScreen as ScannerScreenComponent } from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import { Code } from 'react-native-vision-camera';

import { useInvitationHandling } from '../../hooks/core/deep-link';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';

const permissions = [
  {
    info: {
      buttonNegative: 'Cancel',
      buttonNeutral: 'Ask Me Later',
      buttonPositive: 'OK',
      message: 'App needs access to your camera ',
      title: 'App Camera Permission',
    },
    type: PermissionsAndroid.PERMISSIONS.CAMERA,
  },
  {
    info: {
      buttonNegative: 'Cancel',
      buttonNeutral: 'Ask Me Later',
      buttonPositive: 'OK',
      message: 'App needs access to your bluetooth',
      title: 'App Bluetooth Permission',
    },
    type: PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  },
  {
    info: {
      buttonNegative: 'Cancel',
      buttonNeutral: 'Ask Me Later',
      buttonPositive: 'OK',
      message: 'App needs access to your bluetooth',
      title: 'App Bluetooth Scan Permission',
    },
    type: PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  },
  {
    info: {
      buttonNegative: 'Cancel',
      buttonNeutral: 'Ask Me Later',
      buttonPositive: 'OK',
      message: 'App needs access to your bluetooth',
      title: 'App Bluetooth Advertise Permission',
    },
    type: PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
  },
  {
    info: {
      buttonNegative: 'Cancel',
      buttonNeutral: 'Ask Me Later',
      buttonPositive: 'OK',
      message: 'App needs access to your location',
      title: 'App Location Permission',
    },
    type: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  },
];

const requestCameraPermission = async () => {
  for await (const permission of permissions) {
    try {
      const granted = await PermissionsAndroid.request(
        permission.type,
        permission.info,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

const QRCodeScannerScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeScanner'>>();
  const [code, setCode] = useState<string>();

  const handleCodeScan = useCallback(
    (scannedCode: Code[]) => {
      if (!code) {
        setCode(scannedCode[0].value);
      }
    },
    [code, setCode],
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraPermission();
    }
  }, []);

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
