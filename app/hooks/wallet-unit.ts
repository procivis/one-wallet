import { useONECore } from '@procivis/one-react-native-components';
import { WalletUnitStatusEnum } from '@procivis/react-native-one-core';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { config } from '../config';
import { useStores } from '../models';

export const ATTESTATION_QUERY_KEY = 'wallet-unit-attestation';

export const useWalletUnitAttestation = (active = true) => {
  const { core, organisationId } = useONECore();

  return useQuery(
    [ATTESTATION_QUERY_KEY, organisationId],
    () => core.holderGetWalletUnitAttestation(organisationId),
    {
      enabled: active,
      keepPreviousData: true,
    },
  );
};

export const useRegisterWalletUnit = () => {
  const queryClient = useQueryClient();
  const { core, organisationId } = useONECore();
  const { walletStore } = useStores();

  return useMutation(
    async () => {
      const result = await core.holderRegisterWalletUnit({
        keyType: 'ECDSA',
        organisationId,
        walletProvider: config.walletProvider,
      });

      // Store the attestation key ID in the wallet store
      walletStore.updateAttestationKeyId(result.keyId);

      return result;
    },
    {
      onSuccess: () =>
        queryClient.invalidateQueries([ATTESTATION_QUERY_KEY, organisationId]),
    },
  );
};

export const useRefreshWalletUnit = () => {
  const queryClient = useQueryClient();
  const { core, organisationId } = useONECore();

  return useMutation(
    async () =>
      core.holderRefreshWalletUnit({
        appIntegrityCheckRequired:
          config.walletProvider.appIntegrityCheckRequired,
        organisationId,
      }),
    {
      onError: () =>
        queryClient.invalidateQueries([ATTESTATION_QUERY_KEY, organisationId]),
      onSuccess: () =>
        queryClient.invalidateQueries([ATTESTATION_QUERY_KEY, organisationId]),
    },
  );
};

export const useWalletUnitCheck = () => {
  const { data: walletUnitAttestation, isLoading } = useWalletUnitAttestation();
  const {
    mutateAsync: refreshWalletUnit,
    isLoading: isRefreshing,
    status: refreshStatus,
  } = useRefreshWalletUnit();

  useEffect(() => {
    if (isLoading || refreshStatus !== 'idle') {
      return;
    }
    if (walletUnitAttestation?.status === WalletUnitStatusEnum.ACTIVE) {
      refreshWalletUnit();
    }
  }, [isLoading, refreshStatus, walletUnitAttestation, refreshWalletUnit]);

  return {
    walletUnitAttestation:
      isLoading || isRefreshing ? undefined : walletUnitAttestation,
  };
};
