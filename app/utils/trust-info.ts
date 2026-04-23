import {
  TrustInfoDetailsScreenLabels,
  TrustInfoLabels,
} from '@procivis/one-react-native-components';

import { translate } from '../i18n';

export const trustInfoLabels = (): TrustInfoLabels => {
  return {
    unknown: translate('common.untrusted'),
    unknownSubline: translate('common.untrustedRelyingParty'),
  };
};

export const trustInfoDetailsScreenLabels =
  (): TrustInfoDetailsScreenLabels => {
    return {
      ...trustInfoLabels(),
      collapse: translate('common.seeLess'),
      country: translate('common.country'),
      email: translate('common.email'),
      expand: translate('common.seeMore'),
      identifier: translate('common.identifier'),
      isPublicSector: translate('common.isPublicSector'),
      phone: translate('common.phoneNumber'),
      privacyPolicy: translate('common.privacyPolicy'),
      serviceDescription: translate('common.serviceDescription'),
      supervisoryAuthority: translate('common.supervisoryAuthority'),
      support: translate('common.support'),
      title: translate('common.trustInformation'),
      true: translate('common.true'),
      website: translate('common.website'),
    };
  };
