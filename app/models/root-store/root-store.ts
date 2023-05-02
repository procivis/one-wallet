import { Instance, SnapshotOut, types } from 'mobx-state-tree';

import { BackendConfigStoreModel } from '../backend-config-store/backend-config-store';
import { LocaleStoreModel } from '../locale-store/locale-store';
import { UserSettingsStoreModel } from '../user-settings-store/user-settings-store';
import { WalletStoreModel } from '../wallet-store/wallet-store';

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore", {
  walletStore: WalletStoreModel,
  backendConfigStore: BackendConfigStoreModel,
  locale: LocaleStoreModel,
  userSettings: UserSettingsStoreModel,
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
