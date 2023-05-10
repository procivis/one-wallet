import { NavigationContext, NavigationProp, NavigationRouteContext, Route } from '@react-navigation/native';
import React from 'react';

// Dummy navigation object
const outsideTreeNavigation: NavigationProp<Record<string, undefined>, string, any, any, any> = {
  setParams: () => undefined,
  setOptions: () => undefined,
  dispatch: () => undefined,
  navigate: () => undefined,
  reset: () => undefined,
  goBack: () => undefined,
  isFocused: () => true,
  canGoBack: () => false,
  getParent: () => undefined as any,
  getState: () => undefined,
  getId: () => undefined,
  addListener: () => () => undefined,
  removeListener: () => undefined,
};

// Dummy route object
const outsideTreeRoute: Route<string, undefined> = {
  key: 'OUT',
  name: 'OUT',
};

// Dummy navigation context provider used for UI components that need access to navigation objects
export const OutsideTreeNavigationProvider: React.FC = ({ children }) => (
  <NavigationContext.Provider value={outsideTreeNavigation}>
    <NavigationRouteContext.Provider value={outsideTreeRoute}>{children}</NavigationRouteContext.Provider>
  </NavigationContext.Provider>
);
