import { onSnapshot } from 'mobx-state-tree';

import { defaultLocale } from '../../i18n';
import i18n from '../../i18n/i18n';
import * as storage from '../../utils/storage';
import { Environment } from '../environment';
import {
  LocaleStore,
  LocaleStoreModel,
  LocaleStoreSnapshot,
} from './locale-store';

const LOCALE_STATE_STORAGE_KEY = 'locale';

export async function setupLocaleStore(env: Environment) {
  let localeStore: LocaleStore;
  const defaultData: LocaleStoreSnapshot = {
    locale: defaultLocale(),
  };

  try {
    const data: LocaleStoreSnapshot = {
      ...defaultData,
      ...(await storage.load(LOCALE_STATE_STORAGE_KEY)),
    };
    localeStore = LocaleStoreModel.create(data, env);
    i18n.locale = data.locale;
  } catch (_e) {
    localeStore = LocaleStoreModel.create(defaultData, env);
  }

  onSnapshot(localeStore, (snapshot) => {
    storage.save(LOCALE_STATE_STORAGE_KEY, snapshot);
  });

  return localeStore;
}
