import { useONECore } from '@procivis/one-react-native-components';
import { Ubiqu } from '@procivis/react-native-one-core';
import { useCallback } from 'react';

import { useStores } from '../models';

const {
  reset: resetRSE,
  setBiometrics: setRSEBiometrics,
  areBiometricsSupported: areRSEBiometricsSupported,
} = Ubiqu;

export const useCreateRSE = () => {
  const { userSettings, walletStore } = useStores();
  const { core, organisationId } = useONECore();

  const setupRSE = useCallback(
    (rseDidId: string) => {
      walletStore.rseSetup(rseDidId);
      if (userSettings.biometrics) {
        return areRSEBiometricsSupported()
          .then(async (supported) => {
            if (!supported) {
              return rseDidId;
            }
            await setRSEBiometrics(true);
            return rseDidId;
          })
          .catch(() => rseDidId);
      } else {
        return rseDidId;
      }
    },
    [userSettings.biometrics, walletStore],
  );

  const createIdentifier = useCallback(
    (rseKeyId: string) => {
      return core
        .createIdentifier({
          did: {
            keys: {
              assertionMethod: [rseKeyId],
              authentication: [rseKeyId],
              capabilityDelegation: [rseKeyId],
              capabilityInvocation: [rseKeyId],
              keyAgreement: [rseKeyId],
            },
            method: 'KEY',
            params: {},
          },
          name: 'holder-did-rse-key',
          organisationId,
        })
        .then(setupRSE)
        .catch(async (e) => {
          await resetRSE().catch(() => {});
          throw e;
        });
    },
    [core, organisationId, setupRSE],
  );

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
      .then(createIdentifier)
      .catch(async (e) => {
        await resetRSE().catch(() => {});
        throw e;
      });
  }, [core, createIdentifier, organisationId]);

  return { generateRSE };
};
