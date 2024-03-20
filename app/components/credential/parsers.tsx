import {
  CredentialAttributeItemProps,
  CredentialCardProps,
  CredentialDetailsCardProps,
  CredentialHeaderProps,
} from '@procivis/one-react-native-components';
import { formatDate, formatDateTime } from '@procivis/react-native-components';
import {
  Config,
  CredentialDetail,
  CredentialListItem,
  CredentialStateEnum,
  DataTypeEnum,
} from '@procivis/react-native-one-core';

import { translate } from '../../i18n';

export const cardHeaderFromCredentialListItem = (
  credential: CredentialListItem,
): Omit<CredentialHeaderProps, 'style' | 'testID'> => {
  let credentialDetail;
  let credentialDetailErrorColor;
  switch (credential.state) {
    case CredentialStateEnum.SUSPENDED:
      credentialDetail = translate('credentialDetail.log.suspended');
      break;
    case CredentialStateEnum.REVOKED:
      credentialDetail = translate('credentialDetail.log.revoked');
      credentialDetailErrorColor = true;
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
    credentialName: credential.schema.name,
    icon: undefined,
    iconLabelColor: undefined,
  };
};

export const cardFromCredentialListItem = (
  credential: CredentialListItem,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style' | 'testID'> => {
  return {
    cardImage: undefined,
    color: undefined,
    header: cardHeaderFromCredentialListItem(credential),
  };
};

export const detailsCardFromCredential = (
  credential: CredentialDetail,
  config?: Config,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const attributes: Omit<
    CredentialAttributeItemProps,
    'style' | 'onImagePreview' | 'last'
  >[] = credential.claims.map((claim) => {
    let value;
    let image;
    const typeConfig = config?.datatype[claim.dataType];
    switch (typeConfig?.type) {
      case DataTypeEnum.Date: {
        value = formatDate(new Date(claim.value)) ?? claim.value;
        break;
      }
      case DataTypeEnum.File: {
        if (typeConfig.params?.showAs === 'IMAGE') {
          image = { uri: claim.value };
        } else {
          value = claim.value;
        }
        break;
      }
      default:
        value = claim.value;
        break;
    }
    return {
      id: claim.id,
      image,
      name: claim.key,
      value,
    };
  });
  return {
    attributes,
    card: cardFromCredentialListItem(credential),
  };
};
