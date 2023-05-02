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
      <NavigationContainer ref={navigationRef} theme={DefaultTheme} onStateChange={onNavigationChange} {...props}>
        <RootNavigator />
      </NavigationContainer>
    </AccessibilityLanguageProvider>
  );
};

AppNavigator.displayName = 'AppNavigator';

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ['welcome']; // TODO: Replace after adding onboarding
export const canExit = (routeName: string) => exitRoutes.includes(routeName);
