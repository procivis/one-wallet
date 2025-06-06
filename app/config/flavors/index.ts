/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import configuration from 'react-native-ultimate-config';

import { AssetsConfiguration } from '../../models/config/assets';
import { Configuration, LocaleOverride } from '../../models/config/config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const configs: {
  assets: AssetsConfiguration;
  config: Configuration;
  localeOverride?: LocaleOverride;
} = (() => {
  if (configuration.CONFIG_NAME === 'procivis') {
    switch (configuration.ENVIRONMENT) {
      case 'dev':
        return require('./procivis/dev');
      case 'test':
        return require('./procivis/test');
      case 'demo':
        return require('./procivis/demo');
      case 'trial':
        return require('./procivis/trial');
    }
  }
})();

export const config: Configuration = configs.config;
export const assets: AssetsConfiguration = configs.assets;
export const localeOverride: LocaleOverride | undefined =
  configs.localeOverride;
