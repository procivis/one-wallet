import { EntityDetailsLabels } from '@procivis/one-react-native-components';
import { TrustEntityRoleBindingEnum } from '@procivis/react-native-one-core';

import { translate } from '../i18n';

export const trustEntityDetailsLabels = (
  role: Exclude<TrustEntityRoleBindingEnum, TrustEntityRoleBindingEnum.BOTH>,
): EntityDetailsLabels => {
  return {
    unknown:
      role === TrustEntityRoleBindingEnum.ISSUER
        ? translate('common.unknownIssuer')
        : translate('common.unknownVerifier'),
  };
};
