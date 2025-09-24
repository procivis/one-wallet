import { HolderAttestationWalletUnitResponse } from '@procivis/react-native-one-core';

export const isWalletAttestationExpired = (
  walletUnitAttestation: HolderAttestationWalletUnitResponse | undefined,
) => {
  return (
    walletUnitAttestation?.expirationDate &&
    Date.parse(walletUnitAttestation.expirationDate) < Date.now()
  );
};
