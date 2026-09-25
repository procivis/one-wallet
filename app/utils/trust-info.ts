import {
  concatTestID,
  NerdModeItemProps,
  TrustInfoDetailsScreenLabels,
  TrustInfoLabels,
} from '@procivis/one-react-native-components';
import {
  TrustInformation,
  TrustResolutionResult,
} from '@procivis/react-native-one-core';

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
      errors: {
        BR_0486: translate('brError.BR_0486'),
        BR_0487: translate('brError.BR_0487'),
        BR_0488: translate('brError.BR_0488'),
        BR_0489: translate('brError.BR_0489'),
        BR_0490: translate('brError.BR_0490'),
        BR_0491: translate('brError.BR_0491'),
        BR_0492: translate('brError.BR_0492'),
        BR_0493: translate('brError.BR_0493'),
        BR_0494: translate('brError.BR_0494'),
        BR_0495: translate('brError.BR_0495'),
        BR_0496: translate('brError.BR_0496'),
        BR_0497: translate('brError.BR_0497'),
        BR_0498: translate('brError.BR_0498'),
        BR_0499: translate('brError.BR_0499'),
        BR_0500: translate('brError.BR_0500'),
        BR_0501: translate('brError.BR_0501'),
        BR_0502: translate('brError.BR_0502'),
        BR_0503: translate('brError.BR_0503'),
      },
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

/**
 * One nerd mode row per ecosystem that rejected the entity, as in the verifier app.
 */
export const ecosystemErrorsNerdModeFields = (
  trustInformation: TrustInformation | undefined,
  testID?: string,
): Array<Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>> => {
  if (
    !trustInformation ||
    trustInformation.result === TrustResolutionResult.TRUSTED
  ) {
    return [];
  }
  return Object.entries(trustInformation.ecosystemErrors).flatMap(
    ([ecosystem, outcome]) =>
      outcome.error
        ? [
            {
              attributeKey: `${ecosystem} ${translate(
                'common.ecosystemError',
              )}`,
              canBeCopied: true,
              highlightedText: `${outcome.error.errorCode}: ${outcome.error.message}`,
              testID: concatTestID(testID, 'ecosystemError', ecosystem),
            },
          ]
        : [],
  );
};
