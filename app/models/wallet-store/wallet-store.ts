import { Instance, types } from 'mobx-state-tree';

/**
 * Store containing Wallet info
 */

const UpdateScreenModel = types.model('UpdateScreen', {
  link: types.optional(types.string, ''),
});

const AppVersionModel = types.model('AppVersion', {
  minimum: types.maybe(types.string),
  minimumRecommended: types.maybe(types.string),
  reject: types.optional(types.array(types.string), []),
  updateScreen: types.maybe(UpdateScreenModel),
});

const WalletUnitRegistrationModel = types.model('WalletUnitRegistration', {
  appIntegrityCheckRequired: types.boolean,
  enabled: types.boolean,
  required: types.boolean,
});

export const WalletProviderModel = types.model('WalletProvider', {
  appVersion: types.maybe(AppVersionModel),
  name: types.string,
  walletUnitAttestation: WalletUnitRegistrationModel,
});

export type WalletProviderData = Instance<typeof WalletProviderModel>;

export const WalletStoreModel = types
  .model('WalletStore', {
    isNFCSupported: types.boolean,
    isRSESetup: types.boolean,
    walletProvider: WalletProviderModel,
    walletUnitId: types.string,
  })
  .views((self) => ({
    get registeredWalletUnitId() {
      return self.walletUnitId ? self.walletUnitId : undefined;
    },
  }))
  .actions((self) => ({
    rseSetupCompleted: () => {
      self.isRSESetup = true;
    },
    walletDeleted: () => {
      self.walletUnitId = '';
      self.isRSESetup = false;
    },
    walletUnitIdSetup: (walletUnitId: string) => {
      self.walletUnitId = walletUnitId;
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
