import configuration from 'react-native-ultimate-config';

import { AssetsConfiguration } from '../../models/config/assets';
import { Configuration, LocaleOverride } from '../../models/config/config';

const configs: {
  assets: AssetsConfiguration;
  config: Configuration;
  localeOverride?: LocaleOverride;
} = (() => {
  switch (configuration.CONFIG_NAME) {
    case 'procivis':
      switch (configuration.ENVIRONMENT) {
        case 'dev':
          return require('./procivis/dev');
        case 'test':
          return require('./procivis/test');
        case 'demo':
          return require('./procivis');
      }
  }
})();

export const config: Configuration = configs.config;
export const assets: AssetsConfiguration = configs.assets;
export const localeOverride: LocaleOverride | undefined =
  configs.localeOverride;
