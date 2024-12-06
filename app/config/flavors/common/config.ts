import rnuc from 'react-native-ultimate-config';

import { Configuration } from '../../../models/config/config';

export const commonConfig: Pick<
  Configuration,
  'featureFlags' | 'trustAnchorPublisherReference'
> = {
  featureFlags: {
    isoMdl: true,
    localization: true,
  },
  trustAnchorPublisherReference: rnuc.TRUST_ANCHOR_PUBLISHER_REFERENCE,
};
