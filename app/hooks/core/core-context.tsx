import { initializeCore, ONECore } from '@procivis/react-native-one-core';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { reportException } from '../../utils/reporting';

interface ContextValue {
  core: ONECore;
  initialize: (force?: boolean) => Promise<ONECore>;
}

const defaultContextValue: ContextValue = {
  core: {} as ONECore,
  initialize: () => Promise.reject(),
};

const ONECoreContext = createContext<ContextValue>(defaultContextValue);

export const ONECoreContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [core, setCore] = useState<ONECore>();

  const initialize = useCallback(
    async (force?: boolean) => {
      if (core && !force) {
        return core;
      }

      try {
        const coreInstance = await initializeCore();
        setCore(coreInstance);
        return coreInstance;
      } catch (e) {
        reportException(e, 'Failed to initialize core');
        throw e;
      }
    },
    [core],
  );

  useEffect(
    () => {
      const corePromise = initialize();
      return () => {
        corePromise.then((c) => c?.uninitialize(false));
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const contextValue = useMemo(
    () => ({
      core: core ?? defaultContextValue.core,
      initialize,
    }),
    [core, initialize],
  );

  if (!core) {
    return null;
  }

  return (
    <ONECoreContext.Provider value={contextValue}>
      {children}
    </ONECoreContext.Provider>
  );
};

export const useONECore = () => useContext(ONECoreContext);
