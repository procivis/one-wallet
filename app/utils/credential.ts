import {
  concatTestID,
  CredentialAttribute,
  CredentialAttributeValue,
  CredentialCardProps,
  CredentialDetailsCardProps,
  CredentialErrorIcon,
  CredentialHeaderProps,
  CredentialWarningIcon,
} from '@procivis/one-react-native-components';
import {
  Claim,
  Config,
  CredentialDetail,
  CredentialListItem,
  CredentialListQuery,
  CredentialSchema,
  CredentialStateEnum,
  DataTypeEnum,
  FormatFeatureEnum,
} from '@procivis/react-native-one-core';

import { translate } from '../i18n';
import { getCarouselImagesFromClaims } from './credential-images';
import { formatDateLocalized, formatDateTimeLocalized } from './date';

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

const findClaimByPathParts = (
  path: string[],
  claims?: Claim[],
): Claim | undefined => {
  if (!claims?.length) {
    return undefined;
  }
  const [first, ...rest] = path;
  const claim = claims.find((c) => c.key === first);
  if (!claim || !rest.length || claim.dataType !== DataTypeEnum.Object) {
    return claim;
  }

  return findClaimByPathParts(rest, claim.value as Claim[]);
};

export const findClaimByPath = (
  path: string | undefined,
  claims: Claim[] | undefined,
) => (path ? findClaimByPathParts(path.split('/'), claims) : undefined);

const formatCredentialDetail = (claim: Claim, config?: Config): string => {
  const typeConfig = config?.datatype[claim.dataType];

  if (claim.array) {
    return (claim.value as Claim[])
      .map((c) => formatCredentialDetail(c, config))
      .join(', ');
  }

  if (typeConfig?.type === DataTypeEnum.Date) {
    return formatDateLocalized(new Date(claim.value as string)) as string;
  }

  return claim.value as string;
};

export const cardHeaderFromCredentialListItem = (
  credential: CredentialListItem,
  claims: Claim[] = [],
  config?: Config,
  testID?: string,
): Omit<CredentialHeaderProps, 'style'> => {
  let credentialDetailPrimary =
    formatDateTimeLocalized(new Date(credential.issuanceDate)) ?? '';

  let credentialDetailSecondary: string | undefined;
  let credentialDetailErrorColor: boolean | undefined;
  let credentialDetailTestID: string | undefined;
  let statusIcon;

  const { layoutProperties } = credential.schema;

  switch (credential.state) {
    case CredentialStateEnum.SUSPENDED:
      credentialDetailPrimary = credential.suspendEndDate
        ? translate('credentialDetail.validity.suspendedUntil', {
            date: formatDateTimeLocalized(new Date(credential.suspendEndDate)),
          })
        : translate('credentialDetail.validity.suspended');
      credentialDetailTestID = concatTestID(testID, 'suspended');
      statusIcon = CredentialWarningIcon;
      break;
    case CredentialStateEnum.REVOKED:
      credentialDetailPrimary = translate('credentialDetail.validity.revoked');
      credentialDetailErrorColor = true;
      credentialDetailTestID = concatTestID(testID, 'revoked');
      statusIcon = CredentialErrorIcon;
      break;
    default: {
      const primary = findClaimByPath(
        layoutProperties?.primaryAttribute,
        claims,
      );

      if (primary) {
        credentialDetailPrimary = formatCredentialDetail(primary, config);
      }

      const secondary = findClaimByPath(
        layoutProperties?.secondaryAttribute,
        claims,
      );

      if (secondary) {
        credentialDetailSecondary = formatCredentialDetail(secondary, config);
      }

      credentialDetailTestID = concatTestID(testID, 'detail');
      break;
    }
  }
  return {
    color: layoutProperties?.logo?.backgroundColor,
    credentialDetailErrorColor,
    credentialDetailPrimary,
    credentialDetailSecondary,
    credentialDetailTestID,
    credentialName: credential.schema.name,
    icon: layoutProperties?.logo?.image
      ? {
          imageSource: {
            uri: layoutProperties.logo.image,
          },
        }
      : undefined,
    iconLabelColor: layoutProperties?.logo?.fontColor,
    statusIcon,
    testID,
  };
};

export const getCredentialCardPropsFromCredential = (
  credential: CredentialListItem,
  claims: Claim[] = [],
  config?: Config,
  notice?: {
    notice: string;
    noticeIcon?: React.ComponentType<any> | React.ReactElement;
  },
  testID?: string,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style'> => {
  const { layoutProperties } = credential.schema;

  const result: Omit<CredentialCardProps, 'onHeaderPress' | 'style'> = {
    cardCarouselImages: getCarouselImagesFromClaims(
      claims,
      layoutProperties,
      concatTestID(testID, 'carousel'),
    ),
    cardImage: layoutProperties?.background?.image
      ? { imageSource: { uri: layoutProperties.background.image } }
      : undefined,
    color: layoutProperties?.background?.color,
    header: cardHeaderFromCredentialListItem(
      credential,
      claims,
      config,
      concatTestID(testID, 'header'),
    ),
    testID,
    ...notice,
  };

  return result;
};

export const detailsCardAttributeFromClaim = (
  claim: Claim,
  config?: Config,
  testID?: string,
): CredentialAttribute => {
  const value = detailsCardAttributeValueFromClaim(claim, config, testID);
  return {
    id: claim.id,
    name: claim.key,
    ...value,
  };
};

const detailsCardAttributeValueFromClaim = (
  claim: Claim,
  config?: Config,
  testID?: string,
): CredentialAttributeValue => {
  const typeConfig = config?.datatype[claim.dataType];

  if (claim.array) {
    return {
      values: claim.value.map((arrayValue, index) => {
        return detailsCardAttributeFromClaim(
          {
            ...arrayValue,
            id: `${arrayValue.id}/${index}`,
          },
          config,
          concatTestID(testID, index.toString()),
        );
      }),
    };
  } else {
    switch (typeConfig?.type) {
      case DataTypeEnum.Object: {
        return {
          attributes: (claim.value as Claim[]).map((nestedClaim, index) =>
            detailsCardAttributeFromClaim(
              nestedClaim,
              config,
              concatTestID(testID, index.toString()),
            ),
          ),
        };
      }
      case DataTypeEnum.Date: {
        const date = claim.value as string;
        return {
          testID: testID,
          value: formatDateLocalized(new Date(date)) ?? date,
        };
      }
      case DataTypeEnum.File: {
        if (typeConfig.params?.showAs === 'IMAGE') {
          return { image: { uri: claim.value as string }, testID: testID };
        } else {
          return { testID: testID, value: claim.value as string };
        }
      }
      default:
        return { testID: testID, value: String(claim.value) };
    }
  }
};

export const detailsCardFromCredential = (
  credential: CredentialDetail,
  config?: Config,
  testID?: string,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  return detailsCardFromCredentialWithClaims(
    credential,
    credential.claims,
    config,
    testID,
  );
};

export const detailsCardFromCredentialWithClaims = (
  credential: CredentialDetail,
  claims: Claim[],
  config?: Config,
  testID?: string,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const attributes: CredentialAttribute[] = claims.map((claim, index) =>
    detailsCardAttributeFromClaim(
      claim,
      config,
      concatTestID(testID, 'attribute', index.toString()),
    ),
  );

  const card = getCredentialCardPropsFromCredential(
    credential,
    claims,
    config,
    undefined,
    concatTestID(testID, 'card'),
  );

  return {
    attributes,
    card,
  };
};

// Converts a flat list of attributes into a nested structure
// modifies the names to not include slashes
export const nestAttributes = (
  attributes: CredentialAttribute[],
): CredentialAttribute[] => {
  const result: CredentialAttribute[] = [];

  for (const attribute of attributes) {
    const attributePath = attribute.name!.split('/');
    if (attributePath.length === 0) {
      result.push(attribute);
    } else {
      const [first, ...rest] = attributePath;
      const parent = result.find((a) => a.name === first);
      if (parent) {
        insertAttributeInObject({ ...attribute, name: rest.join('/') }, parent);
      } else {
        result.push(nestAttributeInDummyObject(attribute));
      }
    }
  }

  return result;
};

// We nest the leaf node in a (one or more) nested object(s)
// to make sure the tree structure is correctly rendered in proof request screens.
const nestAttributeInDummyObject = (
  attribute: CredentialAttribute,
): CredentialAttribute => {
  const pathParts = attribute.name!.split('/');
  const [first, ...rest] = pathParts;
  if (!rest.length) {
    return attribute;
  }

  // The dummy object is not selectable, and contains a placeholder ID
  // the user can't interact with it.
  return {
    attributes: [
      nestAttributeInDummyObject({ ...attribute, name: rest.join('/') }),
    ],
    disabled: true,
    id: `${attribute.id}/${first}`,
    name: first,
  };
};

// Recursively insert an attribute into an object
// Will create nested objects if necessary
const insertAttributeInObject = (
  attribute: CredentialAttribute,
  object: CredentialAttribute,
) => {
  const pathParts = attribute.name!.split('/');
  const [first, ...rest] = pathParts;

  const nextParent = object.attributes?.find((a) => a.name === first);

  if (!nextParent) {
    object.attributes?.push(nestAttributeInDummyObject(attribute));
  } else {
    insertAttributeInObject({ ...attribute, name: rest.join('/') }, nextParent);
  }
};

function parseBase64Image(image: string | undefined) {
  return image ? '__BASE64IMAGE__' : '';
}

export function getCredentialSchemaWithoutImages(
  credentialSchema: CredentialSchema,
) {
  return {
    ...credentialSchema,
    layoutProperties: {
      ...credentialSchema.layoutProperties,
      background: {
        ...credentialSchema.layoutProperties?.background,
        image: parseBase64Image(
          credentialSchema.layoutProperties?.background?.image,
        ),
      },
      logo: {
        ...credentialSchema.layoutProperties?.logo,
        image: parseBase64Image(credentialSchema.layoutProperties?.logo?.image),
      },
    },
  };
}
