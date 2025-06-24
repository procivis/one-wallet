import { useIsFocused } from '@react-navigation/native';
import { autorun } from 'mobx';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import RNScreenshotPrevent from 'rn-screenshot-prevent';

import { useStores } from '../models';

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
export const useCapturePrevention = (enabled = true) => {
  const isFocused = useIsFocused();
  const { userSettings } = useStores();

  useEffect(() => {
    let disabler: (() => void) | undefined;
    const reactionDisposer = autorun(() => {
      if (userSettings.screenCaptureProtection && enabled && isFocused) {
        enable();

        disabler = () => {
          disable();
        };
      }
    });
    return () => {
      disabler?.();
      reactionDisposer();
    };
  }, [enabled, isFocused, userSettings.screenCaptureProtection]);
};
