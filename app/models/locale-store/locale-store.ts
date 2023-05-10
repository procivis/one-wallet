import i18n from 'i18n-js';
import { Instance, SnapshotOut, types } from 'mobx-state-tree';

import { Locale, Locales } from '../../i18n';

/**
 * Store containing Wallet info
 */
export const LocaleStoreModel = types
  .model('LocaleStore', {
    locale: types.enumeration(Locales),
  })
  .actions((self) => ({
    changeLocale: (newLocale: Locale) => {
      i18n.locale = newLocale;
      self.locale = newLocale;
    },
  }));

type LocaleStoreType = Instance<typeof LocaleStoreModel>;
export interface LocaleStore extends LocaleStoreType {}
type LocaleStoreSnapshotType = SnapshotOut<typeof LocaleStoreModel>;
export interface LocaleStoreSnapshot extends LocaleStoreSnapshotType {}
