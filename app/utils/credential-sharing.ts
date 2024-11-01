import {
  ShareCredentialCardLabels,
  ShareCredentialLabels,
} from '@procivis/one-react-native-components';

import { translate } from '../i18n';
import { credentialCardLabels } from './credential';

export const shareCredentialCardLabels = (): ShareCredentialCardLabels => {
  return {
    ...credentialCardLabels(),
    missingAttribute: translate('proofRequest.missingAttribute'),
    missingCredential: translate('proofRequest.missingCredential.title'),
    multipleCredentials: translate('proofRequest.multipleCredentials.detail'),
    selectiveDisclosureNotice: translate(
      'proofRequest.selectiveDisclosure.notice',
    ),
  };
};

export const shareCredentialLabels = (): ShareCredentialLabels => {
  return {
    ...shareCredentialCardLabels(),
    invalidCredentialNotice: translate('proofRequest.invalidCredential.notice'),
    multipleCredentialsNotice: translate(
      'proofRequest.multipleCredentials.notice',
    ),
    multipleCredentialsSelect: translate(
      'proofRequest.multipleCredentials.select',
    ),
    revokedCredentialNotice: translate('proofRequest.revokedCredential.notice'),
    suspendedCredentialNotice: translate(
      'proofRequest.suspendedCredential.notice',
    ),
  };
};
