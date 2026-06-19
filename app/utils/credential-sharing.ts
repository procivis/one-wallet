import {
  ShareCredentialCardLabels,
  ShareCredentialLabels,
} from '@procivis/one-react-native-components';

import { translate } from '../i18n';
import { credentialCardLabels } from './credential';

export const shareCredentialCardLabels = (): ShareCredentialCardLabels => {
  return {
    ...credentialCardLabels(),
    disclosurePolicyViolation: translate(
      'info.proofRequest.disclosurePolicyViolation',
    ),
    missingAttribute: translate('common.missingAttribute'),
    missingCredential: translate('common.credentialMissing'),
    multipleCredentials: translate(
      'info.proofRequest.multipleCredentials.detail',
    ),
    selectiveDisclosure: translate('info.proofRequest.selectiveDisclosure'),
  };
};

export const shareCredentialLabels = (): ShareCredentialLabels => {
  return {
    ...shareCredentialCardLabels(),
    invalidCredentialNotice: translate(
      'info.proofRequest.invalidCredential.notice',
    ),
    multipleCredentialsNotice: translate(
      'info.proofRequest.multipleCredentials.notice',
    ),
    multipleCredentialsSelect: translate('common.selectVersion'),
    revokedCredentialNotice: translate(
      'info.proofRequest.revokedCredential.notice',
    ),
    suspendedCredentialNotice: translate(
      'info.proofRequest.suspendedCredential.notice',
    ),
  };
};
