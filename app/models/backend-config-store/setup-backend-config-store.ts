import { onSnapshot } from 'mobx-state-tree';

import { config } from '../../config';
import * as storage from '../../utils/storage';
import { Environment } from '../environment';
import { BackendConfigStore, BackendConfigStoreModel } from './backend-config-store';

const BACKEND_CONFIG_STATE_STORAGE_KEY = 'backend-config';

export async function setupBackendConfigStore(env: Environment) {
  let backendConfigStore: BackendConfigStore;
  const defaultData = {
    backendUrl: config.backendConfig.host,
  };

  try {
    const data = { ...defaultData, ...(await storage.load(BACKEND_CONFIG_STATE_STORAGE_KEY)) };
    backendConfigStore = BackendConfigStoreModel.create(data, env);
  } catch (e) {
    backendConfigStore = BackendConfigStoreModel.create(defaultData, env);

    __DEV__ && console.tron.error?.(e instanceof Error ? e.message : e, null);
  }

  onSnapshot(backendConfigStore, (snapshot) => {
    storage.save(BACKEND_CONFIG_STATE_STORAGE_KEY, snapshot);
  });

  return backendConfigStore;
}
