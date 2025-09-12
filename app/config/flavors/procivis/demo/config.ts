import { Configuration } from '../../../../models/config/config';
import { config as procivisConfig } from '../config';

export const config: Configuration = {
  ...procivisConfig,
  backendConfig: {
    endpoints: procivisConfig.backendConfig.endpoints,
    host: 'TODO',
  },
  walletProvider: {
    ...procivisConfig.walletProvider,
    url: 'https://core.demo.procivis-one.com',
  },
};
