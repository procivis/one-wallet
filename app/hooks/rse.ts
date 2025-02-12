import { useONECore } from '@procivis/one-react-native-components';
import { Ubiqu } from '@procivis/react-native-one-core';
import { useCallback } from 'react';

import { useStores } from '../models';

const { reset: resetRSE } = Ubiqu;

export const useCreateRSE = () => {
  const { walletStore } = useStores();
  const { core, organisationId } = useONECore();

  const generateRSE = useCallback(() => {
    return core
      .generateKey({
        keyParams: {},
        keyType: 'EDDSA',
        name: 'holder-key-rse',
        organisationId,
        storageParams: {},
        storageType: 'UBIQU_RSE',
      })
      .then((rseKeyId) => {
        return core
          .createDid({
            didMethod: 'KEY',
            keys: {
              assertionMethod: [rseKeyId],
              authentication: [rseKeyId],
              capabilityDelegation: [rseKeyId],
              capabilityInvocation: [rseKeyId],
              keyAgreement: [rseKeyId],
            },
            name: 'holder-did-rse-key',
            organisationId,
            params: {},
          })
          .then((rseDidId) => {
            walletStore.rseSetup(rseDidId);
            return rseDidId;
          })
          .catch(async (e) => {
            await resetRSE().catch(() => {});
            throw e;
          });
      })
      .catch(async (e) => {
        await resetRSE().catch(() => {});
        throw e;
      });
  }, [core, organisationId, walletStore]);

  return { generateRSE };
};
