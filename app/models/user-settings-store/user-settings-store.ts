import { Instance, SnapshotOut, types } from 'mobx-state-tree';

export const UserSettingsStoreModel = types
  .model('UserSettingsStore', {
    biometricLogin: types.boolean,
    unsafeOverrideConnectionLabel: types.boolean,
  })
  .actions((self) => ({
    switchBiometricLogin: (enabled: boolean) => {
      self.biometricLogin = enabled;
    },
    switchUnsafeOverrideConnectionLabel: (enabled: boolean) => {
      self.unsafeOverrideConnectionLabel = enabled;
    },
  }));

type UserSettingsStoreType = Instance<typeof UserSettingsStoreModel>;
export interface UserSettingsStore extends UserSettingsStoreType {}
type UserSettingsStoreSnapshotType = SnapshotOut<typeof UserSettingsStoreModel>;
export interface UserSettingsStoreSnapshot extends UserSettingsStoreSnapshotType {}
