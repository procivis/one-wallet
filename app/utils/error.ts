import { OneError } from '@procivis/react-native-one-core';

export const isInvalidInvitationUrlError = (error: unknown) => {
  if (error && error instanceof OneError) {
    if (['BR_0046', 'BR_0062', 'BR_0085'].includes(error.code)) {
      return true;
    }
  }

  return false;
};

export const isUntrustedPartyError = (error: unknown) => {
  if (error && error instanceof OneError) {
    if (['BR_0410', 'BR_0433'].includes(error.code)) {
      return true;
    }
  }

  return false;
};

export const isDisallowedByTrustEcosystemError = (error: unknown) => {
  if (error && error instanceof OneError) {
    if (['BR_0411'].includes(error.code)) {
      return true;
    }
  }

  return false;
};
