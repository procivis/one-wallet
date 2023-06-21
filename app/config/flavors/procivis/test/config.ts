import { Configuration } from '../../../../models/config/config';
import { config as procivisConfig } from '..';

export const config: Configuration = {
  ...procivisConfig,
  backendConfig: {
    host: 'TODO',
    endpoints: procivisConfig.backendConfig.endpoints,
  },
};
