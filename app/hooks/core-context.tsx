import React, { FunctionComponent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initializeCore, ONECore } from 'react-native-one-core';

import { reportError, reportException } from '../utils/reporting';

interface ContextValue {
  core?: ONECore;
  reinitialize: () => Promise<void>;
}
const ONECoreContext = React.createContext<ContextValue>({ reinitialize: async () => undefined });

export const ONECoreContextProvider: FunctionComponent = ({ children }) => {
  const [core, setCore] = useState<ONECore>();

  const initialize = useCallback(() => {
    setCore(undefined);
    return initializeCore()
      .then(setCore)
      .catch((e) => {
        reportException(e, "Couldn't initialize core");
      });
  }, []);

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const contextValue = useMemo<ContextValue>(() => ({ core, reinitialize: initialize }), [core, initialize]);
  return <ONECoreContext.Provider value={contextValue}>{children}</ONECoreContext.Provider>;
};

export const useONECore = () => useContext(ONECoreContext).core;

export const useReinitializeONECore = () => useContext(ONECoreContext).reinitialize;

export const useGetONECore = () => {
  const core = useONECore();

  return useCallback(() => {
    if (!core) {
      reportError('Core not initialized');
      throw new Error('Core not initialized');
    }
    return core;
  }, [core]);
};
