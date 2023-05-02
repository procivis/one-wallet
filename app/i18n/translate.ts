import i18n from 'i18n-js';

import { config } from '../config';
import { TxKeyPath } from './i18n';

const globalTranslateOptions = {
  appName: config.appName,
};

/**
 * Translates text.
 *
 * @param key The i18n key.
 */
export function translate(key: TxKeyPath, options?: i18n.TranslateOptions) {
  return i18n.t(key, { ...globalTranslateOptions, ...options });
}

/**
 * Defines prescription for a label to be translated later
 * Either with or without additional options
 */
export type TranslationLabel = TxKeyPath | [TxKeyPath, i18n.TranslateOptions];

export function translateLabel(label: TranslationLabel) {
  return Array.isArray(label) ? translate(...label) : translate(label);
}
