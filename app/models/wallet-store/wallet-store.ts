import { Instance, types } from 'mobx-state-tree';

/**
 * Store containing Wallet info
 */
export const WalletStoreModel = types
  .model('WalletStore', {
    holderDidId: types.string,
  })
  .actions((self) => ({
    walletSetup: (holderDidId: string) => {
      self.holderDidId = holderDidId;
    },
    walletDeleted: () => {
      self.holderDidId = '';
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
