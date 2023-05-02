import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Returns current app state
 */
export function useAppState() {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return appState;
}

export function useIsAppActive(): boolean {
  const appState = useAppState();
  return appState === 'active';
}

/**
 * Keeps the phone awake
 * @param {boolean} keepAwake only keep the phone awake if `true` (default)
 */
export function useKeepAwake(keepAwake: boolean = true) {
  useEffect(() => {
    if (keepAwake) {
      activateKeepAwake();
      return () => deactivateKeepAwake();
    }
    return undefined;
  }, [keepAwake]);
}
