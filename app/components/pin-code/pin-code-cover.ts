import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';

import { hideSplashScreen } from '../../navigators/root/initialRoute';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { useIsAppActive } from '../../utils/appState';
import { usePinCodeInitialized } from './pin-code-entry';

const PIN_CODE_INACTIVE_TIMEOUT = 60000;

let backgroundPinLockEnabled = true;
/**
 * Explicitly disable showing of PIN lock screen when app goes to background
 * @returns {Function} Function to re-enable the PIN lock screen
 */
export const preventBackgroundLockScreen = () => {
  backgroundPinLockEnabled = false;
  return () => {
    backgroundPinLockEnabled = true;
  };
};

/**
 * Checks for AppState changes and shows PIN code check screen if inactive for long time
 */
export const usePinCodeCheckLogic = (enabled: boolean) => {
  const navigation = useNavigation<RootNavigationProp>();

  const pinCodeInitialized = useRef<boolean>();
  pinCodeInitialized.current = usePinCodeInitialized();

  const showPinCodeCheck = useCallback(() => {
    if (!pinCodeInitialized.current || !backgroundPinLockEnabled) return false;
    const { routes, index } = navigation.getState?.() || {};
    const currentRoute = routes?.[index ?? 0]?.name;
    if (currentRoute !== 'PinCodeCheck') {
      navigation.navigate('PinCodeCheck');
      return true;
    }
    return false;
  }, [navigation]);

  const hidePinCodeCheck = useCallback(() => {
    const { routes, index } = navigation.getState?.() || {};
    const currentRoute = routes?.[index ?? 0]?.name;
    if (currentRoute === 'PinCodeCheck') {
      navigation.goBack();
    }
  }, [navigation]);

  const appActive = useIsAppActive();

  // show lockscreen when app going to background
  const lockedWhenGoingToBackground = useRef<boolean>(false);
  useEffect(() => {
    if (!enabled) return;
    if (!appActive) {
      lockedWhenGoingToBackground.current = showPinCodeCheck();
    }
  }, [appActive, enabled, showPinCodeCheck]);

  const lastActiveTimestamp = useRef<number>(0);
  useEffect(() => {
    if (!enabled) return;
    if (appActive) {
      // show lockscreen when in background for a long time
      if (lastActiveTimestamp.current + PIN_CODE_INACTIVE_TIMEOUT < Date.now()) {
        lockedWhenGoingToBackground.current = false;
        if (showPinCodeCheck()) return;
      } else if (lockedWhenGoingToBackground.current) {
        // hide lockscreen when reopening after short time
        hidePinCodeCheck();
      }
      lockedWhenGoingToBackground.current = false;
      hideSplashScreen();
    } else {
      lastActiveTimestamp.current = Date.now();
    }
  }, [appActive, enabled, showPinCodeCheck, hidePinCodeCheck]);
};
