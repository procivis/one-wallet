import { WalletProviderTypeEnum } from '@procivis/react-native-one-core';
import rnuc from 'react-native-ultimate-config';

import { Configuration } from '../../../models/config/config';

export const commonConfig: Pick<
  Configuration,
  | 'featureFlags'
  | 'trustAnchorPublisherReference'
  | 'customOpenIdUrlScheme'
  | 'requestCredentialRedirectUri'
  | 'walletProvider'
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
    requestCredentialEnabled: true,
    ubiquRse: true,
  },
  requestCredentialRedirectUri: `${rnuc.CONFIG_NAME}-one-wallet-${rnuc.ENVIRONMENT}://request-credential-redirect`,
  trustAnchorPublisherReference: rnuc.TRUST_ANCHOR_PUBLISHER_REFERENCE,
  walletProvider: {
    enabled: true,
    name: 'PROCIVIS_ONE',
    required: false,
    type: WalletProviderTypeEnum.PROCIVIS_ONE,
    url: 'https://core.dev.procivis-one.com',
  },
};
