import {
  createNavigationContainerRef,
  NavigationState,
  PartialState,
} from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';

export const navigationRef = createNavigationContainerRef<any>();

/**
 * Gets the current screen from any navigation state.
 */
export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState>,
): string | undefined {
  if (state.index === undefined) {
    return undefined;
  }
  const route = state.routes[state.index];

  // Found the active route -- return the name
  if (!route.state) {
    return route.name;
  }

  // Recursive call to deal with nested routers
  return getActiveRouteName(route.state);
}

/**
 * Hook that handles Android back button presses
 * @param {boolean} buttonDisabled Only disable back button if `true` (default)
 */
export function useDisableBackButton(buttonDisabled: boolean = true) {
  useEffect(() => {
    if (buttonDisabled) {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true,
      );
      return () => subscription.remove();
    }
    return undefined;
  }, [buttonDisabled]);
}

/**
 * Hook that handles Android back button presses and forwards those on to
 * the navigation or allows exiting the app.
 */
export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  const canExitRef = useRef(canExit);

  useEffect(() => {
    canExitRef.current = canExit;
  }, [canExit]);

  useEffect(() => {
    // We'll fire this when the back button is pressed on Android.
    const onBackPress = () => {
      if (!navigationRef.isReady()) {
        return false;
      }

      // grab the current route
      const routeName = getActiveRouteName(navigationRef.getRootState());

      // are we allowed to exit?
      if (routeName && canExitRef.current(routeName)) {
        // let the system know we've not handled this event
        return false;
      }

      // we can't exit, so let's turn this into a back action
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      return false;
    };

    // Subscribe when we come to life
    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    // Unsubscribe when we're done
    return () => {
      backHandlerSubscription.remove();
    };
  }, []);
}

/**
 * Custom hook for persisting navigation state.
 */
export function useNavigationPersistence(storage: any, persistenceKey: string) {
  const [initialNavigationState, setInitialNavigationState] = useState();

  // This feature is particularly useful in development mode.
  // It is selectively enabled in development mode with
  // the following approach. If you'd like to use navigation persistence
  // in production, remove the __DEV__ and set the state to true
  const [isRestored, setIsRestored] = useState(!__DEV__);

  const onNavigationStateChange = (
    state: NavigationState | PartialState<NavigationState>,
  ) => {
    // Persist state to storage
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    storage.save(persistenceKey, state);
  };

  const restoreState = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const state = await storage.load(persistenceKey);
      if (state) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setInitialNavigationState(state);
      }
    } finally {
      setIsRestored(true);
    }
  }, [persistenceKey, storage]);

  useEffect(() => {
    if (!isRestored) {
      restoreState();
    }
  }, [isRestored, restoreState]);

  return {
    initialNavigationState,
    isRestored,
    onNavigationStateChange,
    restoreState,
  };
}

/**
 * use this to navigate to navigate without the navigation
 * prop. If you have access to the navigation prop, do not use this.
 * More info: https://reactnavigation.org/docs/navigating-without-navigation-prop/
 */
export function navigate(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate<any>(name as never, params as never);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function resetRoot(
  params: PartialState<NavigationState> | NavigationState = {
    index: 0,
    routes: [],
  },
) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot(params);
  }
}

/** screens displayed as full-screen modal */
export const FULL_SCREEN_MODAL_OPTIONS: NativeStackNavigationOptions = {
  animation: Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
  headerShown: false,
  presentation: 'fullScreenModal',
};

/** screens displayed as action sheet overlay */
export const FORM_SHEET_OPTIONS: NativeStackNavigationOptions = {
  animation: Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
  headerShown: false,
  presentation: Platform.OS === 'android' ? 'modal' : 'formSheet',
};
