import i18n from 'i18n-js';
import { findBestLanguageTag } from 'react-native-localize';
import { register } from 'timeago.js';
import timeAgoDe from 'timeago.js/lib/lang/de';
import timeAgoEn from 'timeago.js/lib/lang/en_US';

import { localeOverride } from '../config';
import de from './de/translation.json';
import en from './en/translation.json';

const translations = {
  en: Object.assign(en, localeOverride?.en),
  de: Object.assign(de, localeOverride?.de),
};

i18n.defaultSeparator = '_';
i18n.translations = translations;
i18n.defaultLocale = 'en';
i18n.fallbacks = true;

export type Locale = keyof typeof translations;
export const Locales = Object.keys(translations) as Locale[];

export const defaultLocale = (): Locale => {
  const result = findBestLanguageTag(Locales);
  if (!result) {
    return i18n.defaultLocale as Locale;
  }

  const localeLanguage = result.languageTag.split('-')[0] as Locale;
  if (Locales.includes(localeLanguage)) {
    return localeLanguage;
  }
  return i18n.defaultLocale as Locale;
};

i18n.locale = defaultLocale();

/**
 * Builds up valid keypaths for translations.
 * Update to your default locale of choice if not English.
 */
type DefaultLocale = typeof en;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

type RecursiveKeyOf<TObj extends Record<string, unknown>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, unknown>
    ? // @ts-ignore: excessively deep
      `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & string];

export const registerTimeAgoLocales = () => {
  register('en', timeAgoEn);
  register('de', timeAgoDe);
};
