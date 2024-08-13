import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { check, PERMISSIONS, PermissionStatus } from 'react-native-permissions';

const platformPermission =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

export const useCameraPermission = (): {
  cameraPermission: PermissionStatus | null;
} => {
  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      check(platformPermission).then((result) => setCameraPermission(result));
    }
  }, [isFocused]);

  return { cameraPermission };
};
