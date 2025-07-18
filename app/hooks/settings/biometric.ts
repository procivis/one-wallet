import {
  reportException,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import { RESULTS } from 'react-native-permissions';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { useFaceIDPermission } from '../pin-code/biometric';
import { useExplicitPinCodeCheck } from '../pin-code/pin-code-check';

const {
  addEventListener: addRSEEventListener,
  areBiometricsSupported: areRSEBiometricsSupported,
  PinEventType,
  PinFlowType,
  setBiometrics: setRSEBiometrics,
} = Ubiqu;

/**
 * Provides toggle functionality for the biometric setting item
 */
export function useBiometricSetting() {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<SettingsNavigationProp<'SettingsDashboard'>>();
  const { userSettings, walletStore } = useStores();
  const { status: faceIdStatus, request: requestFaceIdPermission } =
    useFaceIDPermission();
  const runAfterPinCheck = useExplicitPinCodeCheck();

  const toggleUnavailable = faceIdStatus === RESULTS.BLOCKED;

  useEffect(() => {
    return addRSEEventListener((event) => {
      if (event.type !== PinEventType.SHOW_PIN) {
        return;
      }
      if (event.flowType === PinFlowType.ADD_BIOMETRICS) {
        navigation.navigate('RSEAddBiometrics');
      }
    });
  }, [navigation]);

  const setupRSEBiometrics = useCallback(
    (enabled: boolean, success: () => void) => {
      areRSEBiometricsSupported().then((supported) => {
        if (!supported) {
          success();
          return;
        }
        setRSEBiometrics(enabled)
          .then(() => {
            success();
          })
          .catch((e) => {
            const state = enabled ? 'enabled' : 'disabled';
            reportException(e, `Error setting RSE biometrics ${state}`);
          });
      });
    },
    [],
  );

  const setWithPinCheck = useCallback(
    (enabled: boolean) => {
      runAfterPinCheck(
        () => {
          const success = () => {
            userSettings.switchBiometrics(enabled);
            navigation.navigate('BiometricsSet', { enabled });
          };
          if (!walletStore.holderRseIdentifierId) {
            success();
            return;
          }
          setupRSEBiometrics(enabled, success);
        },
        { disableBiometry: true },
      );
    },
    [
      navigation,
      runAfterPinCheck,
      setupRSEBiometrics,
      userSettings,
      walletStore.holderRseIdentifierId,
    ],
  );

  const requestFaceId = useCallback(() => {
    requestFaceIdPermission().then((enabled) => {
      if (enabled) {
        setWithPinCheck(enabled);
      }
    });
  }, [requestFaceIdPermission, setWithPinCheck]);

  const showBlockedAlert = useCallback(() => {
    Alert.alert(
      translate('common.biometricsPermission'),
      translate('info.settings.security.biometrics.permissionBlocked.message'),
      [
        {
          text: translate('common.close'),
        },
        {
          onPress: () => {
            Linking.openSettings();
          },
          text: translate('common.ok'),
        },
      ],
      { userInterfaceStyle: colorScheme.darkMode ? 'dark' : 'light' },
    );
  }, [colorScheme.darkMode]);

  const onPress = useCallback(() => {
    switch (faceIdStatus) {
      case RESULTS.DENIED:
        requestFaceId();
        break;

      case RESULTS.BLOCKED:
        showBlockedAlert();
        break;

      default:
        setWithPinCheck(!userSettings.biometrics);
        break;
    }
  }, [
    faceIdStatus,
    requestFaceId,
    showBlockedAlert,
    setWithPinCheck,
    userSettings.biometrics,
  ]);

  return useMemo(
    () => ({ onPress, toggleUnavailable }),
    [onPress, toggleUnavailable],
  );
}
