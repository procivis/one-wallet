import { useState } from 'react';
import { Platform } from 'react-native';
import { check, PERMISSIONS, PermissionStatus } from 'react-native-permissions';

export const useCameraPermission = (): {
  cameraPermission: PermissionStatus | null;
} => {
  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus | null>(null);

  const platformPermission =
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

  check(platformPermission).then((result) => setCameraPermission(result));
  return { cameraPermission };
};
