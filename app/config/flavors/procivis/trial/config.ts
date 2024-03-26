import { Configuration } from '../../../../models/config/config';
import { config as procivisConfig } from '..';

export const config: Configuration = {
  ...procivisConfig,
  backendConfig: {
    endpoints: procivisConfig.backendConfig.endpoints,
    host: 'TODO',
  },
};
