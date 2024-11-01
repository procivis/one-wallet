import {
  CardHeaderLabels,
  CardLabels,
} from '@procivis/one-react-native-components';

import { translate } from '../i18n';

export const credentialCardHeaderLabels = (): CardHeaderLabels => {
  return {
    revoked: translate('credentialDetail.validity.revoked'),
    suspended: translate('credentialDetail.validity.suspended'),
    suspendedUntil: (date: string) =>
      translate('credentialDetail.validity.suspendedUntil', {
        date,
      }),
    validityIssues: translate('credentialDetail.validity.msoValidityIssue'),
  };
};

export const credentialCardLabels = (): CardLabels => {
  return {
    ...credentialCardHeaderLabels(),
    validityIssuesNotice: translate(
      'credentialDetail.validity.msoValidityIssue.notice',
    ),
  };
};
