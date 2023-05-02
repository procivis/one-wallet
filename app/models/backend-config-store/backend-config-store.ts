import { Instance, types } from 'mobx-state-tree';

/**
 * Store containing Wallet info
 */
export const BackendConfigStoreModel = types
  .model('BackendConfigStore', {
    backendUrl: types.string,
  })
  .actions((self) => ({
    setBackendUrl: (newValue: string) => {
      self.backendUrl = newValue;
    },
  }));

type BackendConfigStoreType = Instance<typeof BackendConfigStoreModel>;
export interface BackendConfigStore extends BackendConfigStoreType {}
