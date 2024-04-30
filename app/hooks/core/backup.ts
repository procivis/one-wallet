import {
  DidTypeEnum,
  OneError,
  OneErrorCode,
} from '@procivis/react-native-one-core';
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useStores } from '../../models';
import { generateUUID } from '../../utils/uuid';
import { useONECore } from './core-context';
import {
  HW_DID_NAME_PREFIX,
  ONE_CORE_ORGANISATION_ID,
  SW_DID_NAME_PREFIX,
} from './core-init';
import { HISTORY_LIST_QUERY_KEY } from './history';

const BACKUP_INFO_QUERY_KEY = 'backup-info';

export const useBackupInfo = () => {
  const { core } = useONECore();

  return useQuery([BACKUP_INFO_QUERY_KEY], () => core.backupInfo(), {
    keepPreviousData: true,
  });
};

export const useCreateBackup = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async ({
      password,
      outputPath,
    }: {
      outputPath: string;
      password: string;
    }) => core.createBackup(password, outputPath),
    {
      onSuccess: () => queryClient.invalidateQueries(HISTORY_LIST_QUERY_KEY),
    },
  );
};

export const useUnpackBackup = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async ({ password, inputPath }: { inputPath: string; password: string }) =>
      core.unpackBackup(password, inputPath),
    {
      onSuccess: () => queryClient.resetQueries(),
    },
  );
};

export const useFinalizeImport = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(async () => core.finalizeImport(), {
    onSuccess: () => queryClient.resetQueries(),
  });
};

export const useRollbackImport = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(async () => core.rollbackImport(), {
    onSuccess: () => queryClient.resetQueries(),
  });
};

export const useBackupFinalizeImportProcedure = () => {
  const { mutateAsync: finalizeImport } = useFinalizeImport();
  const { core } = useONECore();
  const { walletStore } = useStores();

  return useCallback(async () => {
    await finalizeImport();

    // update wallet did references
    const dids = await core.getDids({
      deactivated: false,
      organisationId: ONE_CORE_ORGANISATION_ID,
      page: 0,
      pageSize: 1,
      type: DidTypeEnum.LOCAL,
    });
    let swDidId = dids.values.find((did) =>
      did.name.startsWith(SW_DID_NAME_PREFIX),
    )?.id;

    if (!swDidId) {
      const swKeyId = await core.generateKey({
        keyParams: {},
        keyType: 'EDDSA',
        name: `holder-key-sw-${generateUUID()}`,
        organisationId: ONE_CORE_ORGANISATION_ID,
        storageParams: {},
        storageType: 'INTERNAL',
      });
      swDidId = await core.createDid({
        didMethod: 'KEY',
        keys: {
          assertionMethod: [swKeyId],
          authentication: [swKeyId],
          capabilityDelegation: [swKeyId],
          capabilityInvocation: [swKeyId],
          keyAgreement: [swKeyId],
        },
        name: `${SW_DID_NAME_PREFIX}-${generateUUID()}`,
        organisationId: ONE_CORE_ORGANISATION_ID,
        params: {},
      });
    }

    let hwDidId: string | null = null;
    const hwKeyId = await core
      .generateKey({
        keyParams: {},
        keyType: 'ES256',
        name: `holder-key-hw-${generateUUID()}`,
        organisationId: ONE_CORE_ORGANISATION_ID,
        storageParams: {},
        storageType: 'SECURE_ELEMENT',
      })
      .catch((e) => {
        // ignore if HW keys not supported by device
        if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
          return null;
        }
        throw e;
      });
    if (hwKeyId) {
      hwDidId = await core.createDid({
        didMethod: 'KEY',
        keys: {
          assertionMethod: [hwKeyId],
          authentication: [hwKeyId],
          capabilityDelegation: [hwKeyId],
          capabilityInvocation: [hwKeyId],
          keyAgreement: [hwKeyId],
        },
        name: `${HW_DID_NAME_PREFIX}-${generateUUID()}`,
        organisationId: ONE_CORE_ORGANISATION_ID,
        params: {},
      });
    }

    walletStore.walletSetup(hwDidId, swDidId);
  }, [core, finalizeImport, walletStore]);
};
