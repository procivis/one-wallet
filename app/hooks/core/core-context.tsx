import { initializeCore, ONECore } from '@procivis/react-native-one-core';
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { reportException } from '../../utils/reporting';

interface ContextValue {
  core: ONECore;
  initialize: (force?: boolean) => Promise<void>;
}

const defaultContextValue: ContextValue = {
  core: {} as ONECore,
  initialize: () => Promise.resolve(),
};

const ONECoreContext = createContext<ContextValue>(defaultContextValue);

export const ONECoreContextProvider: FC = ({ children }) => {
  const [core, setCore] = useState<ONECore>();

  const initialize = useCallback(
    async (force?: boolean) => {
      if (core && !force) {
        return;
      }

      try {
        setCore(await initializeCore());
      } catch (e) {
        reportException(e, 'Failed to initialize core');
      }
    },
    [core],
  );

  useEffect(
    () => {
      initialize();
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
