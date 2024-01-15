import {
  DidTypeEnum,
  OneError,
  OneErrorCode,
} from '@procivis/react-native-one-core';
import { useCallback } from 'react';

import { useStores } from '../models';
import { reportException } from '../utils/reporting';
import { useONECore } from './core-context';

// using single static organisation within the wallet for all entries
export const ONE_CORE_ORGANISATION_ID = '11111111-2222-3333-a444-ffffffffffff';

// create base local identifiers in the wallet
export const useInitializeONECoreIdentifiers = () => {
  const { walletStore } = useStores();
  const { core } = useONECore();

  return useCallback(async () => {
    await core
      .createOrganisation(ONE_CORE_ORGANISATION_ID)
      .catch((err) => {
        if (
          err instanceof OneError &&
          err.code === OneErrorCode.AlreadyExists
        ) {
          return;
        }
        throw err;
      })
      .then(() =>
        core
          .generateKey({
            keyParams: {},
            keyType: 'ES256',
            name: 'holder-key',
            organisationId: ONE_CORE_ORGANISATION_ID,
            storageParams: {},
            storageType: 'SECURE_ELEMENT',
          })
          .catch(() =>
            core.generateKey({
              keyParams: {},
              keyType: 'EDDSA',
              name: 'holder-key',
              organisationId: ONE_CORE_ORGANISATION_ID,
              storageParams: {},
              storageType: 'INTERNAL',
            }),
          ),
      )
      .then((keyId) =>
        core.createDid({
          didMethod: 'KEY',
          didType: DidTypeEnum.LOCAL,
          keys: {
            assertion: [keyId],
            authentication: [keyId],
            capabilityDelegation: [keyId],
            capabilityInvocation: [keyId],
            keyAgreement: [keyId],
          },
          name: 'holder-did',
          organisationId: ONE_CORE_ORGANISATION_ID,
          params: {},
        }),
      )
      .then((holderDidId) => {
        walletStore.walletSetup(holderDidId);
      })
      .catch((err) => {
        reportException(err, 'Failed to create base identifiers');
        throw err;
      });
  }, [core, walletStore]);
};
