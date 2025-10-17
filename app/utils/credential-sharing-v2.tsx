import { ShareCredentialGroupLabels } from '@procivis/one-react-native-components';

import { translate } from '../i18n';
import { shareCredentialLabels } from './credential-sharing';

export const shareCredentialGroupLabels = (): ShareCredentialGroupLabels => {
  return {
    ...shareCredentialLabels(),
    groupHeader: translate('info.proofRequest.group.header'),
  };
};
