import { I18n, TranslateOptions } from 'i18n-js/typings';
import { isNil } from 'lodash';
import React from 'react';
import reactStringReplace from 'react-string-replace';

import { config } from '../config';
import i18n, { TxKeyPath } from './i18n';

const globalTranslateOptions = {
  appName: config.appName,
};

const originalInterpolate = i18n.interpolate;

const reactInterpolate = (
  i18nFn: I18n,
  message: string,
  options: TranslateOptions,
) => {
  options = Object.keys(options).reduce((buffer, key) => {
    buffer[i18nFn.transformKey(key)] = options[key];
    return buffer;
  }, {} as TranslateOptions);

  return reactStringReplace(message, i18nFn.placeholder, (match, i) => {
    let value: string | React.ReactElement<unknown> = '';
    const placeholder = match as string;
    const name = placeholder.replace(i18nFn.placeholder, '$1');

    if (!isNil(options[name])) {
      if (React.isValidElement(options[name])) {
        value = options[name];
      } else {
        value = options[name].toString().replace(/\$/gm, '_#$#_');
      }
    } else if (name in options) {
      value = i18nFn.nullPlaceholder(i18nFn, placeholder, message, options);
    } else {
      value = i18nFn.missingPlaceholder(i18nFn, placeholder, message, options);
    }

    return <React.Fragment key={i}>{value}</React.Fragment>;
  });
};

i18n.interpolate = (i, message, options) => {
  // If any of the options is a ReactNode, use ReactInterpolate
  if (Object.values(options).some((value) => typeof value === 'object')) {
    return reactInterpolate(i, message, options) as any;
  }
  return originalInterpolate(i, message, options);
};

/**
 * Translates text.
 *
 * @param key The i18n key.
 */
export function translate(key: TxKeyPath, options?: TranslateOptions) {
  return i18n.t(key, { ...globalTranslateOptions, ...options });
}

/**
 * Defines prescription for a label to be translated later
 * Either with or without additional options
 */
export type TranslationLabel = TxKeyPath | [TxKeyPath, TranslateOptions];

export function translateLabel(label: TranslationLabel) {
  return Array.isArray(label) ? translate(...label) : translate(label);
}
