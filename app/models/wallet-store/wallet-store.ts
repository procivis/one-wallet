import { Instance, types } from 'mobx-state-tree';

/**
 * Store containing Wallet info
 */
export const WalletStoreModel = types
  .model('WalletStore', {
    /** whether the wallet is created */
    exists: types.boolean,
  })
  .actions((self) => ({
    walletCreated: () => {
      self.exists = true;
    },
    walletDeleted: () => {
      self.exists = false;
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
