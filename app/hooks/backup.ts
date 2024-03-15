import { OneError, OneErrorCode } from '@procivis/react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useONECore } from './core-context';

const BACKUP_INFO_QUERY_KEY = 'backup-info';

export const useBackupInfo = () => {
  const { core } = useONECore();

  return useQuery([BACKUP_INFO_QUERY_KEY], () => core.backupInfo(), {
    keepPreviousData: true,
  });
};

export const useCreateBackup = () => {
  const { core } = useONECore();

  return useMutation(
    async ({
      password,
      outputPath,
    }: {
      outputPath: string;
      password: string;
    }) =>
      core.createBackup(password, outputPath).catch((e) => {
        if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
          return;
        }
        throw e;
      }),
  );
};

export const useUnpackBackup = () => {
  const { core } = useONECore();

  return useMutation(
    async ({ password, inputPath }: { inputPath: string; password: string }) =>
      core.unpackBackup(password, inputPath).catch((e) => {
        if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
          return;
        }
        throw e;
      }),
  );
};

export const useFinalizeImport = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async () =>
      core.finalizeImport().catch((e) => {
        if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
          return;
        }
        throw e;
      }),
    {
      onSuccess: () => queryClient.resetQueries(),
    },
  );
};

export const useRollbackImport = () => {
  const { core } = useONECore();

  return useMutation(async () =>
    core.rollbackImport().catch((e) => {
      if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
        return;
      }
      throw e;
    }),
  );
};
