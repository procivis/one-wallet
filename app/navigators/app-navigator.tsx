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

const coreConfig = {
  issuanceProtocol: {
    OPENID4VCI_DRAFT13: {
      params: {
        private: {
          encryption:
            '93d9182795f0d1bec61329fc2d18c4b4c1b7e65e69e20ec30a2101a9875fff7e',
        },
      },
    },
  },
  keyStorage: {
    INTERNAL: {
      params: {
        private: {
          encryption:
            '93d9182795f0d1bec61329fc2d18c4b4c1b7e65e69e20ec30a2101a9875fff7e',
        },
      },
    },
    UBIQU_RSE: { enabled: config.featureFlags.ubiquRse },
  },
  transport: {
    BLE: {
      enabled: config.featureFlags.bleEnabled,
    },
    HTTP: {
      enabled: config.featureFlags.httpTransportEnabled,
    },
    MQTT: {
      enabled: config.featureFlags.mqttTransportEnabled,
    },
  },
  verificationProtocol: {
    ISO_MDL: {
      enabled: config.featureFlags.isoMdl,
    },
  },
};

export const AppNavigator = (props: NavigationProps) => {
  const { locale } = useStores();
  return (
    <AccessibilityLanguageProvider
      language={locale.locale ?? i18n.defaultLocale ?? 'en'}
    >
      <ONECoreContextProvider
        config={coreConfig}
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
