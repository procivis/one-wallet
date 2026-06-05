import { reportException } from '@procivis/one-react-native-components';
import { useEffect, useState } from 'react';
import RNBootSplash from 'react-native-bootsplash';

import { useIsOnboarded } from '../../hooks/onboarded';
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
  const isOnboarded = useIsOnboarded();
  const [initialRoute, setInitialRoute] =
    useState<keyof RootNavigatorParamList>();

  useEffect(() => {
    if (initialRoute) {
      return;
    }
    switch (isOnboarded) {
      case false:
        setInitialRoute('Onboarding');
        break;
      case true:
        setInitialRoute('Dashboard');
        break;
    }
  }, [initialRoute, isOnboarded]);

  useEffect(() => {
    if (initialRoute === 'Onboarding') {
      hideSplashScreen();
    }
  }, [initialRoute]);

  return initialRoute;
};
