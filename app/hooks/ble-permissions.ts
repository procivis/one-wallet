import {
  ExchangeProtocol,
  useMemoAsync,
} from '@procivis/one-react-native-components';
import { useCallback, useState } from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Platform } from 'react-native';
import {
  AndroidPermission,
  checkMultiple,
  PERMISSIONS,
  PermissionStatus,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

type BLEExchange = ExchangeProtocol.OPENID4VC | ExchangeProtocol.ISO_MDL;

const centralPermissionsAndroid = [
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
];
const centralPermissionsAndroidOld = [
  PermissionsAndroid.PERMISSIONS.BLUETOOTH,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
] as AndroidPermission[];
const centralPermissionsIOS = [PERMISSIONS.IOS.BLUETOOTH];
const centralPermissions = (() => {
  if (Platform.OS === 'android') {
    return Platform.Version > 30
      ? centralPermissionsAndroid
      : centralPermissionsAndroidOld;
  } else {
    return centralPermissionsIOS;
  }
})();

const peripheralPermissionsAndroid = [
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
];
const peripheralPermissionsAndroidOld = [
  PermissionsAndroid.PERMISSIONS.BLUETOOTH,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
] as AndroidPermission[];
const peripheralPermissionsIOS = [PERMISSIONS.IOS.BLUETOOTH];
const peripheralPermissions = (() => {
  if (Platform.OS === 'android') {
    return Platform.Version > 30
      ? peripheralPermissionsAndroid
      : peripheralPermissionsAndroidOld;
  } else {
    return peripheralPermissionsIOS;
  }
})();

export const useBlePermissions = (exchange: BLEExchange) => {
  const [interactiveStatus, setInteractiveStatus] =
    useState<PermissionStatus>();

  const permissions =
    exchange === ExchangeProtocol.OPENID4VC
      ? centralPermissions
      : peripheralPermissions;

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
  }, [permissions, status]);

  const requestPermission = useCallback(async () => {
    if (status !== RESULTS.DENIED) {
      return;
    }
    const results = await requestMultiple(permissions);
    const summary = getStrictestResult(Object.values(results));
    if (summary !== status) {
      setInteractiveStatus(getStrictestResult(Object.values(results)));
    }
  }, [permissions, status]);

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
