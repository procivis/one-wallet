import { formatDate } from '@procivis/react-native-components';
import { Claim } from 'react-native-one-core';

/**
 * Format claim value for UI presentation
 */
export const formatClaimValue = (claim: Claim) => {
  switch (claim.dataType) {
    case 'DATE': {
      return formatDate(new Date(claim.value)) ?? claim.value;
    }
    default:
      return claim.value;
  }
};
