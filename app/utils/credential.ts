import {
  CardHeaderLabels,
  CardLabels,
} from '@procivis/one-react-native-components';

import { translate } from '../i18n';

export const credentialCardHeaderLabels = (): CardHeaderLabels => {
  return {
    expired: translate('common.expired'),
    expiredAt: (date: string) =>
      translate('info.credentialDetail.validity.expiredAt', { date }),
    revoked: translate('common.revoked'),
    suspended: translate('common.suspended'),
    suspendedUntil: (date: string) =>
      translate('info.credentialDetail.validity.suspendedUntil', { date }),
    validityIssues: translate('common.validityUpdateIssue'),
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
