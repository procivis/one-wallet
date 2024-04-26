import {
  ONECore,
  OneError,
  OneErrorCode,
} from '@procivis/react-native-one-core';
import { useCallback } from 'react';

import { useStores } from '../../models';
import { reportException } from '../../utils/reporting';
import { useONECore } from './core-context';

// using single static organisation within the wallet for all entries
export const ONE_CORE_ORGANISATION_ID = '11111111-2222-3333-a444-ffffffffffff';
export const SW_DID_NAME_PREFIX = 'holder-did-sw-key';
export const HW_DID_NAME_PREFIX = 'holder-did-hw-key';

const generateHwDid = async (core: ONECore) => {
  const hwKeyId = await core
    .generateKey({
      keyParams: {},
      keyType: 'ES256',
      name: 'holder-key-hw',
      organisationId: ONE_CORE_ORGANISATION_ID,
      storageParams: {},
      storageType: 'SECURE_ELEMENT',
    })
    // ignore if HW key cannot be created
    .catch(() => null);

  if (hwKeyId) {
    return core.createDid({
      didMethod: 'KEY',
      keys: {
        assertionMethod: [hwKeyId],
        authentication: [hwKeyId],
        capabilityDelegation: [hwKeyId],
        capabilityInvocation: [hwKeyId],
        keyAgreement: [hwKeyId],
      },
      name: HW_DID_NAME_PREFIX,
      organisationId: ONE_CORE_ORGANISATION_ID,
      params: {},
    });
  }

  return null;
};

const generateSwDid = async (core: ONECore) => {
  const swKeyId = await core.generateKey({
    keyParams: {},
    keyType: 'EDDSA',
    name: 'holder-key-sw',
    organisationId: ONE_CORE_ORGANISATION_ID,
    storageParams: {},
    storageType: 'INTERNAL',
  });

  return core.createDid({
    didMethod: 'KEY',
    keys: {
      assertionMethod: [swKeyId],
      authentication: [swKeyId],
      capabilityDelegation: [swKeyId],
      capabilityInvocation: [swKeyId],
      keyAgreement: [swKeyId],
    },
    name: SW_DID_NAME_PREFIX,
    organisationId: ONE_CORE_ORGANISATION_ID,
    params: {},
  });
};

// create base local identifiers in the wallet
export const useInitializeONECoreIdentifiers = () => {
  const { walletStore } = useStores();
  const { core } = useONECore();

  return useCallback(async () => {
    // skip if already initialized (during backup restore)
    if (walletStore.holderDidId) {
      return;
    }

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
      .then(() => Promise.all([generateHwDid(core), generateSwDid(core)]))
      .then(([hwDidId, swDidId]) => {
        walletStore.walletSetup(hwDidId, swDidId);
      })
      .catch((err) => {
        reportException(err, 'Failed to create base identifiers');
        throw err;
      });
  }, [core, walletStore]);
};
