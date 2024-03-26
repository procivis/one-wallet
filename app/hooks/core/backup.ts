import { OneError, OneErrorCode } from '@procivis/react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useONECore } from './core-context';
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
    }) =>
      core.createBackup(password, outputPath).catch((e) => {
        if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
          return;
        }
        throw e;
      }),
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
      core.unpackBackup(password, inputPath).catch((e) => {
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
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async () =>
      core.rollbackImport().catch((e) => {
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
