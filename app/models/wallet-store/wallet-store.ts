import { Instance, types } from 'mobx-state-tree';

/**
 * Store containing Wallet info
 */
export const WalletStoreModel = types
  .model('WalletStore', {
    holderAttestationKeyId: types.string,
    holderHwIdentifierId: types.string,
    holderRseIdentifierId: types.string,
    holderSwIdentifierId: types.string,
  })
  .views((self) => ({
    /** returns the did identifier with higher secure available key backing */
    get holderIdentifierId() {
      return self.holderHwIdentifierId
        ? self.holderHwIdentifierId
        : self.holderSwIdentifierId;
    },
  }))
  .actions((self) => ({
    rseSetup: (holderRseIdentifierId: string | null) => {
      self.holderRseIdentifierId = holderRseIdentifierId ?? '';
    },
    walletDeleted: () => {
      self.holderHwIdentifierId = '';
      self.holderSwIdentifierId = '';
      self.holderRseIdentifierId = '';
      self.holderAttestationKeyId = '';
    },
    walletSetup: (
      holderHwIdentifierId: string | null,
      holderSwIdentifierId: string,
      holderAttestationKeyId: string | null,
    ) => {
      self.holderHwIdentifierId = holderHwIdentifierId ?? '';
      self.holderSwIdentifierId = holderSwIdentifierId;
      self.holderAttestationKeyId = holderAttestationKeyId ?? '';
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
