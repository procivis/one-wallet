import {
  Config,
  CredentialListItem,
  CredentialListQuery,
  CredentialStateEnum,
  FormatFeatureEnum,
} from '@procivis/react-native-one-core';

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
