import { useEffect, useMemo } from 'react';
import RNBootSplash from 'react-native-bootsplash';

import { usePinCodeInitialized } from '../../components/pin-code/pin-code';
import { reportException } from '../../utils/reporting';
import { RootNavigatorParamList } from './root-routes';

/**
 * To be called from the initial screen once displayed
 */
export const hideSplashScreen = () => {
  RNBootSplash.hide({ fade: true }).catch((e) => {
    reportException(e, 'Failed to hide splash screen');
  });
};

/**
 * @returns Initial RootNavigation screen routeName or undefined (until initialized)
 */
export const useInitialRoute = () => {
  const pinInitialized = usePinCodeInitialized();
  const initialRoute: keyof RootNavigatorParamList | undefined = useMemo(() => {
    switch (pinInitialized) {
      case undefined:
        return undefined;
      case false:
        return 'Onboarding';
      case true:
        return 'Tabs';
    }
  }, [pinInitialized]);

  useEffect(() => {
    if (initialRoute === 'Onboarding') {
      hideSplashScreen();
    }
  }, [initialRoute]);

  return initialRoute;
};
