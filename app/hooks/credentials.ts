import {
  CredentialStateEnum,
  InvitationResult,
  OneError,
  OneErrorCode,
} from '@procivis/react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useStores } from '../models';
import { useONECore } from './core-context';
import { ONE_CORE_ORGANISATION_ID } from './core-init';

const CREDENTIAL_LIST_QUERY_KEY = 'credential-list';
const CREDENTIAL_DETAIL_QUERY_KEY = 'credential-detail';

export const useCredentials = () => {
  const { core } = useONECore();

  return useQuery(
    [CREDENTIAL_LIST_QUERY_KEY],
    () =>
      core
        .getCredentials({
          organisationId: ONE_CORE_ORGANISATION_ID,
          page: 0,
          // TODO: workaround pagination for now, until it's supported by UI
          pageSize: 10000,
        })
        .then(({ values }) =>
          values.filter(
            ({ state }) =>
              state === CredentialStateEnum.ACCEPTED ||
              state === CredentialStateEnum.REVOKED,
          ),
        ),
    {
      keepPreviousData: true,
    },
  );
};

export const useCredentialDetail = (credentialId: string | undefined) => {
  const { core } = useONECore();

  return useQuery(
    [CREDENTIAL_DETAIL_QUERY_KEY, credentialId],
    () => (credentialId ? core.getCredential(credentialId) : undefined),
    {
      enabled: Boolean(credentialId),
      keepPreviousData: true,
    },
  );
};

export const useInvitationHandler = () => {
  const queryClient = useQueryClient();
  const { walletStore } = useStores();
  const { core } = useONECore();

  return useMutation(
    async (invitationUrl: string) =>
      core.handleInvitation(invitationUrl, walletStore.holderDidId),
    {
      onSuccess: (result: InvitationResult) => {
        if ('credentialIds' in result) {
          queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
        }
      },
    },
  );
};

export const useCredentialAccept = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async (interactionId: string) => core.holderAcceptCredential(interactionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
        queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
      },
    },
  );
};

export const useCredentialReject = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async (interactionId: string) =>
      core.holderRejectCredential(interactionId).catch((e) => {
        if (e instanceof OneError && e.code === OneErrorCode.NotSupported) {
          return;
        }
        throw e;
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
        queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
      },
    },
  );
};

export const useCredentialRevocationCheck = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async (credentialIds: string[]) => core.checkRevocation(credentialIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
        queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
      },
    },
  );
};

export const useCredentialDelete = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async (credentialId: string) => core.deleteCredential(credentialId),
    {
      onSuccess: (_, credentialId) => {
        queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
        queryClient.invalidateQueries([
          CREDENTIAL_DETAIL_QUERY_KEY,
          credentialId,
        ]);
      },
    },
  );
};
