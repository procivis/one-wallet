import rnuc from 'react-native-ultimate-config';

import { Configuration } from '../../../models/config/config';

export const commonConfig: Pick<
  Configuration,
  'featureFlags' | 'trustAnchorPublisherReference' | 'customOpenIdUrlScheme'
> = {
  customOpenIdUrlScheme: rnuc.CUSTOM_OPENID_PROOF_REQUEST_URL_SCHEME
    ? rnuc.CUSTOM_OPENID_PROOF_REQUEST_URL_SCHEME
    : undefined,
  featureFlags: {
    bleEnabled: true,
    httpTransportEnabled: true,
    isoMdl: true,
    localization: true,
    mqttTransportEnabled: true,
    ubiquRse: true,
  },
  trustAnchorPublisherReference: rnuc.TRUST_ANCHOR_PUBLISHER_REFERENCE,
};
