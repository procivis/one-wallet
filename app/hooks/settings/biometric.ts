import { useAppColorScheme } from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import { RESULTS } from 'react-native-permissions';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { useFaceIDPermission } from '../pin-code/biometric';
import { useExplicitPinCodeCheck } from '../pin-code/pin-code-check';

/**
 * Provides toggle functionality for the biometric setting item
 */
export function useBiometricSetting() {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<SettingsNavigationProp<'SettingsDashboard'>>();
  const { userSettings } = useStores();
  const { status: faceIdStatus, request: requestFaceIdPermission } =
    useFaceIDPermission();
  const runAfterPinCheck = useExplicitPinCodeCheck();

  const toggleUnavailable = faceIdStatus === RESULTS.BLOCKED;

  const onPress = useCallback(() => {
    const setWithPinCheck = (enabled: boolean) =>
      runAfterPinCheck(
        () => {
          userSettings.switchBiometrics(enabled);
          navigation.navigate('BiometricsSet', { enabled });
        },
        { disableBiometry: true },
      );

    switch (faceIdStatus) {
      case RESULTS.DENIED:
        requestFaceIdPermission().then((enabled) => {
          if (enabled) {
            setWithPinCheck(enabled);
          }
        });
        break;

      case RESULTS.BLOCKED:
        Alert.alert(
          translate('settings.security.biometrics.permissionBlocked.title'),
          translate('settings.security.biometrics.permissionBlocked.message'),
          [
            {
              text: translate('common.close'),
            },
            {
              onPress: () => Linking.openSettings(),
              text: translate('common.ok'),
            },
          ],
          { userInterfaceStyle: colorScheme.darkMode ? 'dark' : 'light' },
        );
        break;

      default:
        setWithPinCheck(!userSettings.biometrics);
        break;
    }
  }, [
    faceIdStatus,
    runAfterPinCheck,
    userSettings,
    navigation,
    requestFaceIdPermission,
    colorScheme,
  ]);

  return useMemo(
    () => ({ onPress, toggleUnavailable }),
    [onPress, toggleUnavailable],
  );
}
