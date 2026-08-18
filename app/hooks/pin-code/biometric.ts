import {
  reportException,
  useMemoAsync,
} from '@procivis/one-react-native-components';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import {
  check as checkPermission,
  PERMISSIONS,
  PermissionStatus,
  request as requestPermission,
  RESULTS,
} from 'react-native-permissions';

export enum Biometry {
  FaceID = 'faceID',
  Other = 'other',
}

export async function getBiometricType(): Promise<Biometry | null> {
  const rnBiometrics = new ReactNativeBiometrics();
  try {
    const { biometryType } = await rnBiometrics.isSensorAvailable();
    if (!biometryType) {
      return null;
    }

    if (biometryType === 'FaceID') {
      return Biometry.FaceID;
    } else {
      return Biometry.Other;
    }
  } catch (e) {
    reportException(e, 'Unable to find biometric type');
  }
  return null;
}

export async function biometricAuthenticate(options: {
  cancelLabel: string;
  promptMessage: string;
}): Promise<void> {
  const rnBiometrics = new ReactNativeBiometrics();
  await rnBiometrics.simplePrompt({
    cancelButtonText: options.cancelLabel,
    promptMessage: options.promptMessage,
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
