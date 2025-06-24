import { Instance, SnapshotOut, types } from 'mobx-state-tree';

const PinCodeSecurityModel = types.model({
  failedAttempts: types.number,
  lastAttemptTimestamp: types.maybe(types.number),
});

export const UserSettingsStoreModel = types
  .model('UserSettingsStore', {
    biometrics: types.boolean,
    pinCodeSecurity: PinCodeSecurityModel,
    screenCaptureProtection: types.boolean,
  })
  .actions((self) => ({
    setPinCodeSecurity: (
      failedAttempts: number,
      lastAttemptTimestamp: number | undefined,
    ) => {
      self.pinCodeSecurity.failedAttempts = failedAttempts;
      self.pinCodeSecurity.lastAttemptTimestamp = lastAttemptTimestamp;
    },
    switchBiometrics: (enabled: boolean) => {
      self.biometrics = enabled;
    },
    switchScreenCaptureProtection: (enabled: boolean) => {
      self.screenCaptureProtection = enabled;
    },
  }));

type UserSettingsStoreType = Instance<typeof UserSettingsStoreModel>;
export interface UserSettingsStore extends UserSettingsStoreType {}
type UserSettingsStoreSnapshotType = SnapshotOut<typeof UserSettingsStoreModel>;
export interface UserSettingsStoreSnapshot
  extends UserSettingsStoreSnapshotType {}
