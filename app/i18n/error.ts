import { OneError } from '@procivis/react-native-one-core';

import { TxKeyPath } from './i18n';
import { translate } from './translate';

export const translateError = (
  error: unknown | undefined,
  fallback: string,
) => {
  if (error && error instanceof OneError) {
    return translate(`error.${error.code}` as TxKeyPath, {
      defaultValue: fallback,
    });
  }

  return fallback;
};
