import {
  CommonActions,
  NavigationContext,
  NavigationProp,
  NavigationRouteContext,
  NavigationState,
  Route,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { FC, PropsWithChildren } from 'react';

// Dummy navigation object
const outsideTreeNavigation: NavigationProp<
  Record<string, undefined>,
  string,
  any,
  any,
  any
> = {
  addListener: () => () => undefined,
  canGoBack: () => false,
  dispatch: () => undefined,
  getId: () => undefined,
  getParent: () => undefined as any,
  getState: () => undefined,
  goBack: () => undefined,
  isFocused: () => true,
  navigate: () => undefined,
  removeListener: () => undefined,
  reset: () => undefined,
  setOptions: () => undefined,
  setParams: () => undefined,
};

// Dummy route object
const outsideTreeRoute: Route<string, undefined> = {
  key: 'OUT',
  name: 'OUT',
};

// Dummy navigation context provider used for UI components that need access to navigation objects
export const OutsideTreeNavigationProvider: FC<PropsWithChildren> = ({
  children,
}) => (
  <NavigationContext.Provider value={outsideTreeNavigation}>
    <NavigationRouteContext.Provider value={outsideTreeRoute}>
      {children}
    </NavigationRouteContext.Provider>
  </NavigationContext.Provider>
);

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export const resetNavigationAction = <
  ParamList extends Record<string, object | undefined>,
>(
  navigator: NativeStackNavigationProp<ParamList, any>,
  routes: Pick<
    ArrayElement<NavigationState<ParamList>['routes']>,
    'name' | 'params'
  >[],
) => {
  const resetAction = CommonActions.reset({
    index: 0,
    routes,
  });
  navigator.dispatch(resetAction);
};
