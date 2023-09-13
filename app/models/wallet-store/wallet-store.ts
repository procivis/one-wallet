import { Instance, types } from 'mobx-state-tree';

import { convertNewCredential, DummyCredentialModel, LogAction, NewCredential } from './wallet-store-models';

/**
 * Store containing Wallet info
 */
export const WalletStoreModel = types
  .model('WalletStore', {
    credentials: types.array(DummyCredentialModel),
    holderDidId: types.string,
  })
  .actions((self) => ({
    credentialAdded: (credential: NewCredential) => {
      self.credentials.unshift(convertNewCredential(credential));
    },
    credentialShared: (credentialId: string) => {
      const credential = self.credentials.find(({ id }) => id === credentialId);
      if (credential) {
        credential.log.unshift({ action: LogAction.Share });
      }
    },
    credentialDeleted: (credentialId: string) => {
      const credential = self.credentials.find(({ id }) => id === credentialId);
      if (credential) {
        self.credentials.remove(credential);
      }
    },
    walletSetup: (holderDidId: string) => {
      self.holderDidId = holderDidId;
    },
    walletDeleted: () => {
      self.credentials.clear();
      self.holderDidId = '';
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
