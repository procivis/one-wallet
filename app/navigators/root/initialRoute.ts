import { useEffect } from 'react';
import RNBootSplash from 'react-native-bootsplash';

import { usePinCodeInitialized } from '../../components/pin-code/pin-code-entry';
import { reportException } from '../../utils/reporting';
import { RootNavigatorParamList } from './root-navigator-routes';

/**
 * To be called from the initial screen once displayed
 */
export const hideSplashScreen = () => {
  RNBootSplash.hide({ fade: true }).catch((e) => {
    reportException(e, 'Failed to hide splash screen');
  });
};

/**
 * @returns Initial RootNavigation screen routeName or undefined (until initialized and splash screen hidden)
 */
export const useInitialRoute = () => {
  const pinInitialized = usePinCodeInitialized();
  const initialRoute: keyof RootNavigatorParamList | undefined =
    pinInitialized === undefined ? undefined : pinInitialized ? 'Tabs' : 'Onboarding';

  useEffect(() => {
    if (initialRoute === 'Onboarding') {
      hideSplashScreen();
    }
  }, [initialRoute]);

  return initialRoute;
};
