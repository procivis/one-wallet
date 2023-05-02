import { onSnapshot } from 'mobx-state-tree';
import Config from 'react-native-ultimate-config';

import * as storage from '../../utils/storage';
import { Environment } from '../environment';
import { UserSettingsStore, UserSettingsStoreModel, UserSettingsStoreSnapshot } from './user-settings-store';

const USER_SETTINGS_STATE_STORAGE_KEY = 'user_settings';

export async function setupUserSettingsStore(env: Environment) {
  let userSettingsStore: UserSettingsStore;
  const defaultData: UserSettingsStoreSnapshot = {
    biometricLogin: true,
    unsafeOverrideConnectionLabel: Boolean(Config.UNSAFE_OVERRIDE_CONNECTION_LABEL),
  };

  try {
    const data: UserSettingsStoreSnapshot = {
      ...defaultData,
      ...(await storage.load(USER_SETTINGS_STATE_STORAGE_KEY)),
    };
    userSettingsStore = UserSettingsStoreModel.create(data, env);
  } catch (e) {
    userSettingsStore = UserSettingsStoreModel.create(defaultData, env);

    __DEV__ && console.tron.error?.(e instanceof Error ? e.message : e, null);
  }

  onSnapshot(userSettingsStore, (snapshot: UserSettingsStoreSnapshot) => {
    storage.save(USER_SETTINGS_STATE_STORAGE_KEY, snapshot);
  });

  return userSettingsStore;
}
