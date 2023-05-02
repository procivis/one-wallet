import configuration from 'react-native-ultimate-config';

import { AssetsConfiguration } from '../../models/config/assets';
import { Configuration, LocaleOverride } from '../../models/config/config';

let configs: {
  config: Configuration;
  assets: AssetsConfiguration;
  localeOverride?: LocaleOverride;
};

switch (configuration.CONFIG_NAME) {
  case 'procivis':
    if (configuration.DEV_CONFIG === 'true') {
      configs = require('./procivis/dev');
    } else {
      configs = require('./procivis');
    }
    break;
}

export const config: Configuration = configs.config;
export const assets: AssetsConfiguration = configs.assets;
export const localeOverride: LocaleOverride | undefined = configs.localeOverride;
