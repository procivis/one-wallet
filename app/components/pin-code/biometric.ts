import {
  authenticateAsync,
  AuthenticationType,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
} from 'expo-local-authentication';
import { useEffect, useState } from 'react';

import { reportException } from '../../utils/reporting';

export enum Biometry {
  FaceID = 'faceID',
  Other = 'other',
}

export async function getBiometricType(): Promise<Biometry | null> {
  try {
    const enrolled = await isEnrolledAsync();
    if (!enrolled) return null;

    const types = await supportedAuthenticationTypesAsync();
    if (types.includes(AuthenticationType.FACIAL_RECOGNITION)) {
      return Biometry.FaceID;
    } else if (types.length) {
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
  await authenticateAsync({ disableDeviceFallback: true, fallbackLabel: '', ...options }).then((result) => {
    if (!result.success && 'error' in result) {
      throw new Error(result.error);
    }
  });
}

export const useBiometricType = (): Biometry | null => {
  const [biometry, setBiometry] = useState<Biometry | null>(null);
  useEffect(() => {
    getBiometricType().then(setBiometry);
  }, []);
  return biometry;
};
