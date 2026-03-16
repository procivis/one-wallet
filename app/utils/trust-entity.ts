import { EntityDetailsLabels } from '@procivis/one-react-native-components';
import { TrustEntityRole } from '@procivis/react-native-one-core';

import { translate } from '../i18n';

export const trustEntityDetailsLabels = (
  role: Exclude<TrustEntityRole, TrustEntityRole.BOTH>,
): EntityDetailsLabels => {
  return {
    unknown:
      role === TrustEntityRole.ISSUER
        ? translate('common.unknownIssuer')
        : translate('common.unknownVerifier'),
  };
};
