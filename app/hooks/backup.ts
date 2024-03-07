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
      onSuccess: () => {
        queryClient.invalidateQueries(BACKUP_INFO_QUERY_KEY);
      },
    },
  );
};
