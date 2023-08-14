import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import KeepAwake from 'react-native-keep-awake';

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

export function useIsAppActive(): boolean | undefined {
  const appState = useAppState();
  switch (appState) {
    case 'active':
    case 'extension':
      return true;
    case 'inactive':
    case 'background':
      return false;
    default:
      return undefined;
  }
}

/**
 * Keeps the phone awake
 * @param {boolean} keepAwake only keep the phone awake if `true` (default)
 */
export function useKeepAwake(keepAwake: boolean = true) {
  useEffect(() => {
    if (keepAwake) {
      KeepAwake.activate();
      return () => KeepAwake.deactivate();
    }
    return undefined;
  }, [keepAwake]);
}
