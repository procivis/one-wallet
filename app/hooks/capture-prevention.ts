import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import RNScreenshotPrevent from 'react-native-screenshot-prevent';

import { config } from '../config';

let enabledCounter = 0;
const enable = () => {
  if (!enabledCounter++) {
    if (Platform.OS === 'android') {
      RNScreenshotPrevent.enabled(true);
    } else {
      RNScreenshotPrevent.enableSecureView();
    }
  }
};
const disable = () => {
  if (!--enabledCounter) {
    if (Platform.OS === 'android') {
      RNScreenshotPrevent.enabled(false);
    } else {
      RNScreenshotPrevent.disableSecureView();
    }
  }
};

/**
 * Prevents screenshot and video capture of the current screen
 * @param enabled Flag for temporary disable
 */
export function useCapturePrevention(enabled = true) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (config.featureFlags.screenCaptureBlocking && enabled && isFocused) {
      enable();

      return () => {
        disable();
      };
    }
  }, [enabled, isFocused]);
}
