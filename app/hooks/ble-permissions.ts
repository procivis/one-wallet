import { useMemoAsync } from '@procivis/one-react-native-components';
import { useCallback, useRef, useState } from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import {
  AndroidPermission,
  checkMultiple,
  openSettings,
  PERMISSIONS,
  PermissionStatus,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

const permissions =
  Platform.OS === 'android'
    ? Platform.Version > 30
      ? [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]
      : ([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ] as AndroidPermission[])
    : [PERMISSIONS.IOS.BLUETOOTH];

export const useBlePermissions = () => {
  const [interactiveStatus, setInteractiveStatus] =
    useState<PermissionStatus>();

  const initialStatus = useMemoAsync(async () => {
    const statuses = await checkMultiple(permissions);
    return getStrictestResult(Object.values(statuses));
  }, []);

  const status = interactiveStatus ?? initialStatus;

  const checkPermissions = useCallback(async () => {
    const statuses = await checkMultiple(permissions);
    const result = getStrictestResult(Object.values(statuses));

    if (result !== status) {
      setInteractiveStatus(getStrictestResult(Object.values(statuses)));
    }
  }, [status]);

  const requestPermission = useCallback(async () => {
    if (status !== RESULTS.DENIED) {
      return;
    }
    const results = await requestMultiple(permissions);
    const summary = getStrictestResult(Object.values(results));
    if (summary !== status) {
      setInteractiveStatus(getStrictestResult(Object.values(results)));
    }
  }, [status]);

  return { checkPermissions, permissionStatus: status, requestPermission };
};

const getStrictestResult = (results: PermissionStatus[]) => {
  return results.reduce((acc, result) => {
    if (
      acc === RESULTS.BLOCKED ||
      acc === RESULTS.DENIED ||
      acc === RESULTS.UNAVAILABLE
    ) {
      return acc;
    }

    return result;
  }, RESULTS.GRANTED);
};

export const useOpenBleSettings = () => {
  const inFocusFromSettings = useRef<boolean>(false);

  const openBleSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:Bluetooth');
    } else {
      Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
    }

    inFocusFromSettings.current = true;
  }, []);

  const openAppPermissionSettings = useCallback(() => {
    openSettings();
    inFocusFromSettings.current = true;
  }, []);

  return {
    inFocusFromSettings,
    openAppPermissionSettings,
    openBleSettings,
  };
};
