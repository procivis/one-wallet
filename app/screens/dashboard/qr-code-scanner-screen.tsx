import {
  Button,
  ButtonType,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Alert, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { openSettings, RESULTS } from 'react-native-permissions';
import { Code } from 'react-native-vision-camera';

import { ScannerScreen } from '../../components/vision-camera/vision-camera';
import { config } from '../../config';
import { useCameraPermission } from '../../hooks/camera-permissions';
import { useInvitationHandling } from '../../hooks/core/deep-link';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';

const QRCodeScannerScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeScanner'>>();
  const colorScheme = useAppColorScheme();
  const [footerHeight, setFooterHeight] = useState<number>();
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

  const shareQRCode = useCallback(() => {
    navigation.navigate('QRCodeShare');
  }, [navigation]);

  const onFooterLayoutChange = useCallback((event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  }, []);

  const footer = config.featureFlags.isoMdl ? (
    <View onLayout={onFooterLayoutChange} style={styles.footer}>
      <View style={styles.separatorWrapper}>
        <View
          style={[
            styles.separator,
            { backgroundColor: colorScheme.accentText },
          ]}
        />
        <Typography color={colorScheme.accentText} style={styles.separatorText}>
          {translate('wallet.qrCodeScannerScreen.or')}
        </Typography>
        <View
          style={[
            styles.separator,
            { backgroundColor: colorScheme.accentText },
          ]}
        />
      </View>
      <Button
        onPress={shareQRCode}
        title={translate('wallet.qrCodeScannerScreen.share')}
        type={ButtonType.Secondary}
      />
    </View>
  ) : undefined;

  return (
    <View style={styles.screen} testID="QRCodeScannerScreen">
      {cameraPermissionStatus === RESULTS.GRANTED && (
        <ScannerScreen
          footer={footer}
          onClose={navigation.goBack}
          onQRCodeRead={handleCodeScan}
          overlayStyle={
            footerHeight
              ? { paddingBottom: Math.max(footerHeight - 32, 0) }
              : undefined
          }
          title={translate('wallet.qrCodeScannerScreen.title')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingBottom: 29,
    paddingHorizontal: 12,
  },
  // eslint-disable-next-line react-native/no-color-literals
  screen: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
  },
  separator: {
    flex: 1,
    height: 1,
    opacity: 0.7,
  },
  separatorText: {
    marginHorizontal: 4,
  },
  separatorWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 20,
  },
});

export default memo(QRCodeScannerScreen);
