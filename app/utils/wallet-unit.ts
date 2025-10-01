import { WUAState } from '@procivis/one-react-native-components';
import {
  HolderAttestationWalletUnitResponse,
  WalletUnitStatusEnum,
} from '@procivis/react-native-one-core';

export const isWalletAttestationExpired = (
  walletUnitAttestation: HolderAttestationWalletUnitResponse | undefined,
) => {
  return (
    walletUnitAttestation?.expirationDate &&
    Date.parse(walletUnitAttestation.expirationDate) < Date.now()
  );
};

export const walletUnitAttestationState = (
  walletUnitAttestation: HolderAttestationWalletUnitResponse | undefined,
): WUAState | undefined => {
  if (!walletUnitAttestation) {
    return undefined;
  }
  if (walletUnitAttestation.status === WalletUnitStatusEnum.REVOKED) {
    return WUAState.Revoked;
  } else if (isWalletAttestationExpired(walletUnitAttestation)) {
    return WUAState.Expired;
  }
  return WUAState.Valid;
};
