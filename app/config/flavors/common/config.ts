import { Configuration } from '../../../models/config/config';

export const commonConfig: Pick<Configuration, 'featureFlags'> = {
  featureFlags: {
    isoMdl: true,
    localization: true,
  },
};
