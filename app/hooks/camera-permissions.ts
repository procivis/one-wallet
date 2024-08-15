import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  check,
  PERMISSIONS,
  PermissionStatus,
  request as requestPermission,
} from 'react-native-permissions';

import { useIsAppActive } from '../utils/appState';
import { reportException } from '../utils/reporting';

const platformPermission =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

/**
 * On Android the {@link check} call never returns {@link RESULTS.BLOCKED},
 * instead it returns {@link RESULTS.DENIED} and the following {@link requestPermission}
 * immediately returns {@link RESULTS.BLOCKED}.
 */
export const useCameraPermission = () => {
  const [status, setStatus] = useState<PermissionStatus>();
  const appActive = useIsAppActive();

  const requesting = useRef(false);

  const request = useCallback(() => {
    requesting.current = true;
    return requestPermission(platformPermission)
      .then((result) => {
        setStatus(result);
        return result;
      })
      .catch((e) => {
        reportException(e, 'Requesting camera permission');
        return undefined;
      })
      .finally(() => {
        requesting.current = false;
      });
  }, []);

  useEffect(() => {
    if (requesting.current) {
      return;
    }

    if (appActive) {
      check(platformPermission)
        .then((result) => setStatus(result))
        .catch((e) => reportException(e, 'Checking camera permission'));
    } else {
      // When app goes to background the permission might change,
      // so this forces the UI to wait for a new check after reopening
      setStatus(undefined);
    }
  }, [appActive]);

  return { request, status };
};
