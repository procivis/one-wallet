import {
  Button,
  ButtonType,
  getEnabledExchangeProtocols,
  getEnabledTransports,
  Transport,
  Typography,
  useAppColorScheme,
  useCoreConfig,
  VerificationProtocol,
} from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { openSettings, RESULTS } from 'react-native-permissions';
import { Code } from 'react-native-vision-camera';

import { ScannerScreen } from '../../components/vision-camera/vision-camera';
import { config as appConfig } from '../../config';
import { useCameraPermission } from '../../hooks/camera-permissions';
import { useCapturePrevention } from '../../hooks/capture-prevention';
import { useInvitationHandling } from '../../hooks/navigation/deep-link';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';

const QRCodeScannerScreen: FunctionComponent = observer(() => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeScanner'>>();
  const colorScheme = useAppColorScheme();
  const [footerHeight, setFooterHeight] = useState<number>();
  const [code, setCode] = useState<string>();
  const { status: cameraPermissionStatus, request: requestCameraPermission } =
    useCameraPermission();
  const showNFCButton = appConfig.featureFlags.nfcEnabled;
  const isNFCButtonEnabled = Platform.OS !== 'ios';

  useCapturePrevention();

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
        translate('common.permissionRequired'),
        translate(
          'info.wallet.qrCodeScannerScreen.permissions.camera.description',
        ),
        [
          {
            onPress: () => navigation.goBack(),
            text: translate('common.cancel'),
          },
          {
            onPress: () => {
              openSettings();
            },
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

  const { data: config } = useCoreConfig();

  const isBleEnabled = useMemo(
    () => config && getEnabledTransports(config).includes(Transport.Bluetooth),
    [config],
  );

  const isIsoMdlEnabled = useMemo(
    () =>
      config &&
      getEnabledExchangeProtocols(config.verificationProtocol).includes(
        VerificationProtocol.ISO_MDL,
      ),
    [config],
  );

  const handleShareNFC = useCallback(() => {
    if (Platform.OS === 'android') {
      navigation.navigate('QRCodeNFC');
    }
  }, [navigation]);

  const footer =
    isIsoMdlEnabled && isBleEnabled ? (
      <View onLayout={onFooterLayoutChange} style={styles.footer}>
        <View style={styles.separatorWrapper}>
          <View
            style={[
              styles.separator,
              { backgroundColor: colorScheme.accentText },
            ]}
          />
          <Typography
            color={colorScheme.accentText}
            style={styles.separatorText}
          >
            {translate('common.or').toUpperCase()}
          </Typography>
          <View
            style={[
              styles.separator,
              { backgroundColor: colorScheme.accentText },
            ]}
          />
        </View>
        <View style={styles.buttonsGroup}>
          <Button
            onPress={shareQRCode}
            style={styles.button}
            testID="QRCodeScannerScreen.share"
            title={translate('common.shareQrCode')}
            type={ButtonType.Secondary}
          />
          {showNFCButton && (
            <Button
              disabled={!isNFCButtonEnabled}
              onPress={handleShareNFC}
              style={styles.button}
              testID="QRCodeScannerScreen.shareNFC"
              title={translate('common.shareNFC')}
              type={ButtonType.Secondary}
            />
          )}
        </View>
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
          title={translate('info.wallet.qrCodeScannerScreen.title')}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
  },
  buttonsGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
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
