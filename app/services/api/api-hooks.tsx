import { useMemo } from 'react';

import { useStores } from '../../models/root-store/root-store-context';
import { Api } from './api';

export const useApi = () => {
  const { backendConfigStore } = useStores();

  return useMemo<Api>(() => {
    return new Api(backendConfigStore.backendUrl);
  }, [backendConfigStore.backendUrl]);
};
