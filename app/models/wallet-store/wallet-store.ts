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

const FeatureFlagsModel = types.model('FeatureFlags', {
  documentSigningEnabled: types.maybe(types.boolean),
  trustEcosystemsEnabled: types.boolean,
});

const TranslatedLabelModel = types.model('TranslatedLabel', {
  lang: types.string,
  value: types.string,
});

const TrustCollectionModel = types.model('TrustCollection', {
  description: types.array(TranslatedLabelModel),
  displayName: types.array(TranslatedLabelModel),
  id: types.string,
  logo: types.string,
});

const WalletUnitRegistrationModel = types.model('WalletUnitRegistration', {
  appIntegrityCheckRequired: types.boolean,
  enabled: types.boolean,
  required: types.boolean,
});

const DocumentSignerModel = types.model('DocumentSigner', {
  description: types.array(TranslatedLabelModel),
  displayName: types.array(TranslatedLabelModel),
  logo: types.string,
  name: types.string,
  type: types.enumeration('Type', ['WALLET_CENTRIC', 'RP_CENTRIC']),
});

const UserAuthenticationModel = types.model('UserAuthentication', {
  clientId: types.string,
  identityProvider: types.string,
  redirectUri: types.string,
  required: types.boolean,
});

export const WalletProviderModel = types.model('WalletProvider', {
  appVersion: types.maybe(AppVersionModel),
  documentSigners: types.array(DocumentSignerModel),
  featureFlags: types.maybe(FeatureFlagsModel),
  name: types.string,
  trustCollections: types.array(TrustCollectionModel),
  userAuthentication: types.maybe(UserAuthenticationModel),
  walletUnitAttestation: WalletUnitRegistrationModel,
});

export type WalletProviderData = Instance<typeof WalletProviderModel>;
export type DocumentSigner = Instance<typeof DocumentSignerModel>;

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
    walletUnitIdCleared: () => {
      self.walletUnitId = '';
    },
    walletUnitIdSetup: (walletUnitId: string) => {
      self.walletUnitId = walletUnitId;
    },
  }));

export interface WalletStore extends Instance<typeof WalletStoreModel> {}
