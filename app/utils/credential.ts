import {
  concatTestID,
  CredentialAttribute,
  CredentialCardProps,
  CredentialDetailsCardProps,
  CredentialErrorIcon,
  CredentialHeaderProps,
  CredentialWarningIcon,
  formatDate,
  formatDateTime,
} from '@procivis/one-react-native-components';
import {
  Claim,
  Config,
  CredentialDetail,
  CredentialListItem,
  CredentialListQuery,
  CredentialStateEnum,
  DataTypeEnum,
  FormatFeatureEnum,
} from '@procivis/react-native-one-core';

import { translate } from '../i18n';

export enum ValidityState {
  Revoked = 'revoked',
  Suspended = 'suspended',
  Valid = 'valid',
}

export const getQueryKeyFromListQueryParams = (
  queryParams?: Partial<CredentialListQuery>,
) => {
  if (!queryParams) {
    return [];
  }
  const { name } = queryParams;
  return [name];
};

export const getValidityState = (
  credential: CredentialListItem | undefined,
) => {
  if (credential?.state === CredentialStateEnum.REVOKED) {
    return ValidityState.Revoked;
  }
  if (credential?.state === CredentialStateEnum.SUSPENDED) {
    return ValidityState.Suspended;
  }
  return ValidityState.Valid;
};

export const supportsSelectiveDisclosure = (
  credential: CredentialListItem | undefined,
  config: Config | undefined,
) => {
  const formatConfig = credential && config?.format[credential.schema.format];
  return formatConfig
    ? Boolean(
        formatConfig.capabilities?.features?.includes(
          FormatFeatureEnum.SelectiveDisclosure,
        ),
      )
    : undefined;
};

export const cardHeaderFromCredentialListItem = (
  credential: CredentialListItem,
  testID?: string,
): Omit<CredentialHeaderProps, 'style'> => {
  let credentialDetail;
  let credentialDetailErrorColor;
  let credentialDetailTestID;
  let statusIcon;
  switch (credential.state) {
    case CredentialStateEnum.SUSPENDED:
      credentialDetail = translate('credentialDetail.log.suspended');
      credentialDetailTestID = concatTestID(testID, 'suspended');
      statusIcon = CredentialWarningIcon;
      break;
    case CredentialStateEnum.REVOKED:
      credentialDetail = translate('credentialDetail.log.revoked');
      credentialDetailErrorColor = true;
      credentialDetailTestID = concatTestID(testID, 'revoked');
      statusIcon = CredentialErrorIcon;
      break;
    default:
      credentialDetail =
        formatDateTime(new Date(credential.issuanceDate)) ?? '';
      break;
  }
  return {
    color: undefined,
    credentialDetail,
    credentialDetailErrorColor,
    credentialDetailTestID,
    credentialName: credential.schema.name,
    icon: undefined,
    iconLabelColor: undefined,
    statusIcon,
    testID,
  };
};

export const cardFromCredentialListItem = (
  credential: CredentialListItem,
  notice?: {
    notice: string;
    noticeIcon?: React.ComponentType<any> | React.ReactElement;
  },
  testID?: string,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style' | 'testID'> => {
  return {
    cardImage: undefined,
    color: undefined,
    header: cardHeaderFromCredentialListItem(credential, testID),
    ...notice,
  };
};

export const detailsCardAttributeFromClaim = (
  claim: Claim,
  config?: Config,
): CredentialAttribute => {
  const typeConfig = config?.datatype[claim.dataType];

  const attribute: Partial<CredentialAttribute> = {
    id: claim.id,
    name: claim.key,
  };

  switch (typeConfig?.type) {
    case DataTypeEnum.Object: {
      attribute.attributes = (claim.value as Claim[]).map((nestedClaim) =>
        detailsCardAttributeFromClaim(nestedClaim, config),
      );
      break;
    }
    case DataTypeEnum.Date: {
      attribute.value =
        formatDate(new Date(claim.value as string)) ?? (claim.value as string);
      break;
    }
    case DataTypeEnum.File: {
      if (typeConfig.params?.showAs === 'IMAGE') {
        attribute.image = { uri: claim.value as string };
      } else {
        attribute.value = claim.value as string;
      }
      break;
    }
    default:
      attribute.value = claim.value as string;
      break;
  }
  return attribute as CredentialAttribute;
};

export const detailsCardFromCredential = (
  credential: CredentialDetail,
  config?: Config,
  testID?: string,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const attributes: CredentialAttribute[] = credential.claims.map((claim) => {
    return detailsCardAttributeFromClaim(claim, config);
  });
  return {
    attributes,
    card: cardFromCredentialListItem(credential, undefined, testID),
  };
};
