import { useMemoAsync } from '@procivis/one-react-native-components';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  check as checkPermission,
  PERMISSIONS,
  PermissionStatus,
  request as requestPermission,
  RESULTS,
} from 'react-native-permissions';
import TouchID from 'react-native-touch-id';

import { reportException } from '../../utils/reporting';

export enum Biometry {
  FaceID = 'faceID',
  Other = 'other',
}

export async function getBiometricType(): Promise<Biometry | null> {
  try {
    const type = await TouchID.isSupported().catch(() => false);
    if (!type) {
      return null;
    }

    if (type === 'FaceID') {
      return Biometry.FaceID;
    } else {
      return Biometry.Other;
    }
  } catch (e) {
    reportException(e, 'Unable to find biometric type');
  }
  return null;
}

export async function biometricAuthenticate(
  options: { cancelLabel?: string; promptMessage?: string } = {},
): Promise<void> {
  await TouchID.authenticate(options.promptMessage, {
    cancelText: options.cancelLabel,
  });
}

export const useBiometricType = (): Biometry | null => {
  return useMemoAsync(getBiometricType, [], null);
};

export const useFaceIDPermission = () => {
  const initialStatus = useMemoAsync(
    () =>
      Platform.OS === 'ios'
        ? checkPermission(PERMISSIONS.IOS.FACE_ID)
        : RESULTS.UNAVAILABLE,
    [],
  );

  // status updates after interactive requests
  const [interactiveStatus, setInteractiveStatus] =
    useState<PermissionStatus>();

  const status = interactiveStatus ?? initialStatus;

  const request = useCallback(
    async () =>
      status === RESULTS.DENIED
        ? requestPermission(PERMISSIONS.IOS.FACE_ID).then((result) => {
            setInteractiveStatus(result);
            return result === RESULTS.GRANTED;
          })
        : status === RESULTS.GRANTED,
    [status],
  );

  return useMemo(() => ({ request, status }), [status, request]);
};
