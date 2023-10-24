import { useCallback } from 'react';
import ONE, { DidTypeEnum, OneError, OneErrorCode } from 'react-native-one-core';

import { useStores } from '../models';
import { reportException } from '../utils/reporting';

// using single static organisation within the wallet for all entries
export const ONE_CORE_ORGANISATION_ID = '11111111-2222-3333-a444-ffffffffffff';

// create base local identifiers in the wallet
export const useInitializeONECore = () => {
  const { walletStore } = useStores();

  return useCallback(() => {
    ONE.createOrganisation(ONE_CORE_ORGANISATION_ID)
      .catch((err) => {
        if (err instanceof OneError && err.code === OneErrorCode.AlreadyExists) {
          return;
        }
        throw err;
      })
      .then(() =>
        ONE.generateKey({
          organisationId: ONE_CORE_ORGANISATION_ID,
          keyType: 'EDDSA',
          keyParams: {},
          name: 'holder-key',
          storageType: 'INTERNAL',
          storageParams: {},
        }),
      )
      .then((keyId) =>
        ONE.createDid({
          organisationId: ONE_CORE_ORGANISATION_ID,
          name: 'holder-did',
          didType: DidTypeEnum.LOCAL,
          didMethod: 'KEY',
          keys: {
            authentication: [keyId],
            assertion: [keyId],
            keyAgreement: [keyId],
            capabilityInvocation: [keyId],
            capabilityDelegation: [keyId],
          },
          params: {},
        }),
      )
      .then((holderDidId) => {
        walletStore.walletSetup(holderDidId);
      })
      .catch((err) => {
        reportException(err, 'Failed to create base identifiers');
      });
  }, [walletStore]);
};
