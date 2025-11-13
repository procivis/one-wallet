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
  walletLink: types.maybe(types.string),
  walletUnitAttestation: WalletUnitRegistrationModel,
});

export type WalletProviderData = Instance<typeof WalletProviderModel>;

export const WalletStoreModel = types
  .model('WalletStore', {
    holderHwIdentifierId: types.string,
    holderRseIdentifierId: types.string,
    holderSwIdentifierId: types.string,
    isNFCSupported: types.boolean,
    walletProvider: WalletProviderModel,
    walletUnitId: types.string,
  })
  .views((self) => ({
    /** returns the did identifier with higher secure available key backing */
    get holderIdentifierId() {
      return self.holderHwIdentifierId
        ? self.holderHwIdentifierId
        : self.holderSwIdentifierId;
    },
    get registeredWalletUnitId() {
      return self.walletUnitId ? self.walletUnitId : undefined;
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
      self.walletUnitId = '';
    },
    walletSetup: (
      holderHwIdentifierId: string | null,
      holderSwIdentifierId: string,
    ) => {
      self.holderHwIdentifierId = holderHwIdentifierId ?? '';
      self.holderSwIdentifierId = holderSwIdentifierId;
    },
    walletUnitIdSetup: (walletUnitId: string) => {
      self.walletUnitId = walletUnitId;
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
