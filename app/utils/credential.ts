import {
  CardHeaderLabels,
  CardLabels,
  OfferCardLabels,
} from '@procivis/one-react-native-components';

import { translate } from '../i18n';

export const credentialCardHeaderLabels = (): CardHeaderLabels => {
  return {
    expired: translate('common.expired'),
    expiredAt: (date: string) =>
      translate('info.credentialDetail.validity.expiredAt', { date }),
    false: translate('common.false'),
    revoked: translate('common.revoked'),
    suspended: translate('common.suspended'),
    suspendedUntil: (date: string) =>
      translate('info.credentialDetail.validity.suspendedUntil', { date }),
    true: translate('common.true'),
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

export const credentialOfferCardLabels = (): OfferCardLabels => {
  return {
    ...credentialCardLabels(),
    less: translate('common.less'),
    more: translate('common.more'),
    showAll: translate('common.seeAll'),
    showLess: translate('common.seeLess'),
  };
};
