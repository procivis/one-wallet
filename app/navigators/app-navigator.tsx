/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  AccessibilityLanguageProvider,
  ONECoreContextProvider,
  reportTraceInfo,
} from '@procivis/one-react-native-components';
import {
  DefaultTheme,
  NavigationContainer,
  NavigationState,
  PartialState,
} from '@react-navigation/native';
import React from 'react';

import { config } from '../config';
import i18n from '../i18n/i18n';
import { useStores } from '../models';
import { navigationRef } from './navigation-utilities';
import RootNavigator from './root/root-navigator';

const getNavigationPathRecursive = (
  state?: NavigationState | PartialState<NavigationState>,
): string | null => {
  const route =
    state?.index !== undefined ? state.routes[state.index] : undefined;
  if (!route) {
    return null;
  }
  const childRouteNames = getNavigationPathRecursive(route.state);
  if (childRouteNames) {
    return `${route.name}>${childRouteNames}`;
  }
  return route.name;
};

const onNavigationChange = (state?: NavigationState) => {
  const currentRouteName = getNavigationPathRecursive(state);
  if (currentRouteName) {
    reportTraceInfo('Navigation', currentRouteName);
  }
};

interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = (props: NavigationProps) => {
  const { locale } = useStores();
  return (
    <AccessibilityLanguageProvider
      language={locale.locale ?? i18n.defaultLocale ?? 'en'}
    >
      <ONECoreContextProvider
        publisherReference={config.trustAnchorPublisherReference}
      >
        <NavigationContainer
          onStateChange={onNavigationChange}
          ref={navigationRef}
          theme={DefaultTheme}
          {...props}
        >
          <RootNavigator />
        </NavigationContainer>
      </ONECoreContextProvider>
    </AccessibilityLanguageProvider>
  );
};

AppNavigator.displayName = 'AppNavigator';
