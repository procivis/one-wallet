/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
import './utils/ignore-warnings';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  AccessibilityFocusHistoryProvider,
  ColorSchemeProvider,
  queryClient,
  reportException,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { Ubiqu } from '@procivis/react-native-one-core';
import * as Sentry from '@sentry/react-native';
import React, { useEffect, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Config from 'react-native-ultimate-config';
import { QueryClientProvider } from 'react-query';

import { registerTimeAgoLocales } from './i18n';
import { RootStore, RootStoreProvider, setupRootStore } from './models';
import { AppNavigator } from './navigators';
import { ErrorBoundary } from './screens';
import { AppColorScheme, useFlavorColorScheme } from './theme';

const { reset: resetRSE } = Ubiqu;

if (!__DEV__) {
  Sentry.init({
    // Sentry event payload is limited to 200KB, if exceeded, the event report is dumped -> minimize reported data
    beforeBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
      if (breadcrumb.category === 'console') {
        breadcrumb.data = {};
        breadcrumb.message = breadcrumb.message?.substring(0, 50);
      }
      return breadcrumb;
    },
    dsn: 'https://b98a05fd083c47f1a770d74d04df0425@o153694.ingest.sentry.io/4505114160201728',
    enableAppHangTracking: !Config.DETOX_BUILD,
    environment: `${Config.CONFIG_NAME}-${Config.ENVIRONMENT}${
      Config.DETOX_BUILD ? '-detox' : ''
    }`,
    maxBreadcrumbs: 50,
  });
}

/**
 * This is the root component of our app.
 */
function App() {
  const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined);
  const { darkMode } = useAppColorScheme<AppColorScheme>();

  useEffect(() => {
    registerTimeAgoLocales();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      return;
    }
    StatusBar.setBarStyle(darkMode ? 'light-content' : 'dark-content', true);
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setTranslucent(true);
  }, [darkMode]);

  // Kick off initial async loading actions, like loading fonts and RootStore
  useEffect(() => {
    setupRootStore()
      .then(setRootStore)
      .catch((e) => {
        reportException(e, 'setup mobx store failure');
      });
  }, []);

  const colorScheme = useFlavorColorScheme();

  useEffect(() => {
    if (!rootStore) {
      return;
    }
    if (!rootStore.walletStore.holderDidRseId) {
      resetRSE().catch(() => {});
    }
  }, [rootStore]);

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!rootStore) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <RootStoreProvider value={rootStore}>
        <ErrorBoundary catchErrors={'always'}>
          <QueryClientProvider client={queryClient}>
            <ActionSheetProvider>
              <AccessibilityFocusHistoryProvider>
                <ColorSchemeProvider<AppColorScheme> colorScheme={colorScheme}>
                  <AppNavigator />
                </ColorSchemeProvider>
              </AccessibilityFocusHistoryProvider>
            </ActionSheetProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </RootStoreProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(
  gestureHandlerRootHOC(App) as unknown as React.ComponentType,
);
