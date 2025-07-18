import { EntityDetailsLabels } from '@procivis/one-react-native-components';
import { TrustEntityRoleEnum } from '@procivis/react-native-one-core';

import { translate } from '../i18n';

export const trustEntityDetailsLabels = (
  role: Exclude<TrustEntityRoleEnum, TrustEntityRoleEnum.BOTH>,
): EntityDetailsLabels => {
  return {
    unknown:
      role === TrustEntityRoleEnum.ISSUER
        ? translate('common.unknownIssuer')
        : translate('common.unknownVerifier'),
  };
};
