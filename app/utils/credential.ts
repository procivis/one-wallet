import {
  Config,
  CredentialListItem,
  CredentialStateEnum,
  FormatFeatureEnum,
} from '@procivis/react-native-one-core';

export enum ValidityState {
  Revoked = 'revoked',
  Valid = 'valid',
}

export const getValidityState = (
  credential: CredentialListItem | undefined,
) => {
  if (credential?.state === CredentialStateEnum.REVOKED) {
    return ValidityState.Revoked;
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
