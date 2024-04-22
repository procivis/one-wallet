import { Instance, types } from 'mobx-state-tree';

/**
 * Store containing Wallet info
 */
export const WalletStoreModel = types
  .model('WalletStore', {
    holderDidHwId: types.string,
    holderDidSwId: types.string,
  })
  .views((self) => ({
    /** returns the did with most secure available key backing */
    get holderDidId() {
      return self.holderDidHwId ? self.holderDidHwId : self.holderDidSwId;
    },
  }))
  .actions((self) => ({
    walletDeleted: () => {
      self.holderDidHwId = '';
      self.holderDidSwId = '';
    },
    walletSetup: (holderDidHwId: string | null, holderDidSwId: string) => {
      self.holderDidHwId = holderDidHwId ?? '';
      self.holderDidSwId = holderDidSwId;
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
