import { formatDate } from '@procivis/react-native-components';
import {
  Claim,
  Config,
  CredentialListItem,
  FormatFeatureEnum,
} from 'react-native-one-core';

/**
 * Format claim value for UI presentation
 */
export const formatClaimValue = (claim: Claim, config: Config) => {
  switch (config.datatype[claim.dataType]?.type) {
    case 'DATE': {
      return formatDate(new Date(claim.value)) ?? claim.value;
    }
    default:
      return claim.value;
  }
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
