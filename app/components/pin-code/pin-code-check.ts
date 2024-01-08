import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';

import { hideSplashScreen } from '../../navigators/root/initialRoute';
import {
  RootNavigationProp,
  RootNavigatorParamList,
} from '../../navigators/root/root-navigator-routes';
import { useIsAppActive } from '../../utils/appState';
import { reportError } from '../../utils/reporting';

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
export const useAutomaticPinCodeCoverLogic = (enabled: boolean) => {
  const navigation = useNavigation<RootNavigationProp>();

  const showPinCodeCheck = useCallback(() => {
    if (!backgroundPinLockEnabled) {
      return false;
    }
    const { routes, index } = navigation.getState?.() || {};
    const currentRoute = routes?.[index ?? 0]?.name;

    if (currentRoute === 'PinCodeCheck' || currentRoute === 'Onboarding') {
      return false;
    }
    navigation.navigate('PinCodeCheck');
    return true;
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
    if (!enabled) {
      return;
    }
    if (appActive === false) {
      lockedWhenGoingToBackground.current = showPinCodeCheck();
    }
  }, [appActive, enabled, showPinCodeCheck]);

  const lastActiveTimestamp = useRef<number>(0);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const now = Date.now();
    if (appActive) {
      // show lockscreen when in background for a long time or starting the app
      if (lastActiveTimestamp.current + PIN_CODE_INACTIVE_TIMEOUT < now) {
        lockedWhenGoingToBackground.current = false;
        lastActiveTimestamp.current = now;
        if (showPinCodeCheck()) {
          return;
        }
      } else if (lockedWhenGoingToBackground.current) {
        // hide lockscreen when reopening after short time
        hidePinCodeCheck();
      }
      lockedWhenGoingToBackground.current = false;
      hideSplashScreen();
    } else if (appActive === false && lastActiveTimestamp.current) {
      lastActiveTimestamp.current = now;
    }
  }, [appActive, enabled, showPinCodeCheck, hidePinCodeCheck]);
};

type RunAfterPinCheck = (
  fn: () => void,
  params?: RootNavigatorParamList['PinCodeCheck'],
) => void;

/**
 * For use where a PIN code check is part of the flow
 * Perform custom action after successfully passing the PIN code check
 */
export const useExplicitPinCodeCheck = (): RunAfterPinCheck => {
  const navigation = useNavigation<RootNavigationProp>();

  return useCallback<RunAfterPinCheck>(
    (fn, params) => {
      if (!navigation.isFocused()) {
        reportError('Tried to run a PIN code check while not focused');
        return;
      }

      const unsubscribe = navigation.addListener('focus', () => {
        unsubscribe();
        fn();
      });
      navigation.navigate('PinCodeCheck', params);
    },
    [navigation],
  );
};
