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
  ImageOrComponentSource,
} from '@procivis/one-react-native-components';
import {
  Claim,
  Config,
  CredentialDetail,
  CredentialListItem,
  CredentialListQuery,
  CredentialSchemaType,
  CredentialStateEnum,
  DataTypeEnum,
  FormatFeatureEnum,
} from '@procivis/react-native-one-core';
import { ColorValue } from 'react-native';

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
  const { name, sort, sortDirection, exact, role, ids, status, include } =
    queryParams;
  return [name, sort, sortDirection, exact, role, ids, status, include];
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
      credentialDetail = credential.suspendEndDate
        ? translate('credentialDetail.validity.suspendedUntil', {
            date: formatDateTime(new Date(credential.suspendEndDate)),
          })
        : translate('credentialDetail.validity.suspended');
      credentialDetailTestID = concatTestID(testID, 'suspended');
      statusIcon = CredentialWarningIcon;
      break;
    case CredentialStateEnum.REVOKED:
      credentialDetail = translate('credentialDetail.validity.revoked');
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

export const getCredentialCardPropsFromCredential = (
  credential: CredentialListItem,
  notice?: {
    notice: string;
    noticeIcon?: React.ComponentType<any> | React.ReactElement;
  },
  testID?: string,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style' | 'testID'> => {
  const result: Omit<
    CredentialCardProps,
    'onHeaderPress' | 'style' | 'testID'
  > = {
    cardImage: undefined,
    color: undefined,
    header: cardHeaderFromCredentialListItem(credential, testID),
    ...notice,
  };

  const layoutProperties = credential.schema.layoutProperties;
  const procivisBackground =
    credential.schema.schemaType ===
      CredentialSchemaType.PROCIVIS_ONE_SCHEMA2024 &&
    !layoutProperties?.background;

  if (procivisBackground) {
    const definition = getProcivisBackground(credential.schema.name);
    result.cardImage = definition.image;
    result.color = definition.color;
    result.header.iconLabelColor = '#000';
  }

  return result;
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
  const attributes: CredentialAttribute[] = credential.claims.map((claim) =>
    detailsCardAttributeFromClaim(claim, config),
  );
  return {
    attributes,
    card: getCredentialCardPropsFromCredential(credential, undefined, testID),
  };
};

const PROCIVIS_BACKGROUNDS = [
  [require('../../assets/credential-background/01.png'), '#C2CDF1'],
  [require('../../assets/credential-background/02.png'), '#DACDB5'],
  [require('../../assets/credential-background/03.png'), '#FDAFA0'],
  [require('../../assets/credential-background/04.png'), '#C2CDF1'],
  [require('../../assets/credential-background/05.png'), '#E5C7A6'],
  [require('../../assets/credential-background/06.png'), '#7CCCC5'],
  [require('../../assets/credential-background/07.png'), '#F9A968'],
  [require('../../assets/credential-background/08.png'), '#E5AEF6'],
  [require('../../assets/credential-background/09.png'), '#C3CEE7'],
  [require('../../assets/credential-background/10.png'), '#ECBAE6'],
];

interface ProcivisBackground {
  color: ColorValue;
  image: ImageOrComponentSource;
}

const getProcivisBackground = (identifier: string): ProcivisBackground => {
  // simplified digest
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = hash & hash;
  }
  hash = hash < 0 ? -hash : hash;
  const definition = PROCIVIS_BACKGROUNDS[hash % PROCIVIS_BACKGROUNDS.length];
  return {
    color: definition[1],
    image: {
      imageSource: definition[0],
    },
  };
};
