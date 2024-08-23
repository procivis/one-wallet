import { Configuration } from '../../../models/config/config';

export const commonConfig: Pick<Configuration, 'featureFlags'> = {
  featureFlags: {
    isoMdl: false,
    localization: true,
  },
};
