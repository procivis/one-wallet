import {
  OneError,
  OneErrorCode,
  PresentationSubmitCredentialRequest,
} from '@procivis/react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useONECore } from './core-context';

const PROOF_DETAIL_QUERY_KEY = 'proof-detail';

export const useProofDetail = (proofId: string | undefined) => {
  const { core } = useONECore();

  return useQuery(
    [PROOF_DETAIL_QUERY_KEY, proofId],
    () => (proofId ? core.getProof(proofId) : undefined),
    {
      enabled: Boolean(proofId),
      keepPreviousData: true,
    },
  );
};

export const useProofAccept = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async ({
      interactionId,
      credentials,
    }: {
      credentials: Record<string, PresentationSubmitCredentialRequest>;
      interactionId: string;
    }) => core.holderSubmitProof(interactionId, credentials),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(PROOF_DETAIL_QUERY_KEY);
      },
    },
  );
};

export const useProofReject = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async (interactionId: string) =>
      core.holderRejectProof(interactionId).catch((e) => {
        if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
          return;
        }
        throw e;
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(PROOF_DETAIL_QUERY_KEY);
      },
    },
  );
};
