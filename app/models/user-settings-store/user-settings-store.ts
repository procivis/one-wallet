import { Instance, SnapshotOut, types } from 'mobx-state-tree';

export const UserSettingsStoreModel = types
  .model('UserSettingsStore', {
    biometrics: types.boolean,
  })
  .actions((self) => ({
    switchBiometrics: (enabled: boolean) => {
      self.biometrics = enabled;
    },
  }));

type UserSettingsStoreType = Instance<typeof UserSettingsStoreModel>;
export interface UserSettingsStore extends UserSettingsStoreType {}
type UserSettingsStoreSnapshotType = SnapshotOut<typeof UserSettingsStoreModel>;
export interface UserSettingsStoreSnapshot
  extends UserSettingsStoreSnapshotType {}
