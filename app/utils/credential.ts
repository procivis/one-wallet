import {
  CardHeaderLabels,
  CardLabels,
} from '@procivis/one-react-native-components';

import { translate } from '../i18n';

export const credentialCardHeaderLabels = (): CardHeaderLabels => {
  return {
    revoked: translate('common.revoked'),
    suspended: translate('common.suspended'),
    suspendedUntil: (date: string) =>
      translate('info.credentialDetail.validity.suspendedUntil', {
        date,
      }),
    validityIssues: translate('common.validityUpdateIssue'),
    wuaExpired: translate('info.wua.expired'),
    wuaRevoked: translate('info.wua.revoked'),
  };
};

export const credentialCardLabels = (): CardLabels => {
  return {
    ...credentialCardHeaderLabels(),
    validityIssuesNotice: translate(
      'info.credentialDetail.validity.msoValidityIssue.notice',
    ),
  };
};
