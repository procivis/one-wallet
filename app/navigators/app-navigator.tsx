/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { AccessibilityLanguageProvider } from '@procivis/react-native-components';
import { DefaultTheme, NavigationContainer, NavigationState, PartialState } from '@react-navigation/native';
import i18n from 'i18n-js';
import React from 'react';

import { ONECoreContextProvider } from '../hooks/core-context';
import { useStores } from '../models';
import { reportTraceInfo } from '../utils/reporting';
import { navigationRef } from './navigation-utilities';
import RootNavigator from './root/root-navigator';

const getNavigationPathRecursive = (state?: NavigationState | PartialState<NavigationState>): string | null => {
  const route = state?.index !== undefined ? state.routes[state.index] : undefined;
  if (!route) return null;
  const childRouteNames = getNavigationPathRecursive(route.state);
  if (childRouteNames) {
    return `${route.name}>${childRouteNames}`;
  }
  return route.name;
};

const onNavigationChange = (state?: NavigationState) => {
  const currentRouteName = getNavigationPathRecursive(state);
  if (currentRouteName) reportTraceInfo('Navigation', currentRouteName);
};

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = (props: NavigationProps) => {
  const { locale } = useStores();
  return (
    <AccessibilityLanguageProvider language={locale.locale ?? i18n.defaultLocale ?? 'en'}>
      <ONECoreContextProvider>
        <NavigationContainer ref={navigationRef} theme={DefaultTheme} onStateChange={onNavigationChange} {...props}>
          <RootNavigator />
        </NavigationContainer>
      </ONECoreContextProvider>
    </AccessibilityLanguageProvider>
  );
};

AppNavigator.displayName = 'AppNavigator';
