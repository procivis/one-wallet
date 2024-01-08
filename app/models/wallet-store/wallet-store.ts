import { Instance, types } from 'mobx-state-tree';

/**
 * Store containing Wallet info
 */
export const WalletStoreModel = types
  .model('WalletStore', {
    holderDidId: types.string,
  })
  .actions((self) => ({
    walletDeleted: () => {
      self.holderDidId = '';
    },
    walletSetup: (holderDidId: string) => {
      self.holderDidId = holderDidId;
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
