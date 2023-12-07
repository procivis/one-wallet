import { CredentialStateEnum, InvitationResult, OneError, OneErrorCode } from 'react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useStores } from '../models';
import { useGetONECore, useONECore } from './core-context';
import { ONE_CORE_ORGANISATION_ID } from './core-init';

const CREDENTIAL_LIST_QUERY_KEY = 'credential-list';
const CREDENTIAL_DETAIL_QUERY_KEY = 'credential-detail';

export const useCredentials = () => {
  const core = useONECore();
  return useQuery(
    [CREDENTIAL_LIST_QUERY_KEY],
    () =>
      core
        ?.getCredentials({
          page: 0,
          // TODO: workaround pagination for now, until it's supported by UI
          pageSize: 10000,
          organisationId: ONE_CORE_ORGANISATION_ID,
        })
        .then(({ values }) =>
          values.filter(({ state }) => state === CredentialStateEnum.ACCEPTED || state === CredentialStateEnum.REVOKED),
        ),
    {
      keepPreviousData: true,
      enabled: Boolean(core),
    },
  );
};

export const useCredentialDetail = (credentialId: string | undefined) => {
  const core = useONECore();
  return useQuery(
    [CREDENTIAL_DETAIL_QUERY_KEY, credentialId],
    () => (credentialId ? core?.getCredential(credentialId) : undefined),
    {
      keepPreviousData: true,
      enabled: Boolean(credentialId && core),
    },
  );
};

export const useInvitationHandler = () => {
  const queryClient = useQueryClient();
  const { walletStore } = useStores();
  const getCore = useGetONECore();
  return useMutation(
    async (invitationUrl: string) => getCore().handleInvitation(invitationUrl, walletStore.holderDidId),
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
  const getCore = useGetONECore();
  return useMutation(async (interactionId: string) => getCore().holderAcceptCredential(interactionId), {
    onSuccess: () => {
      queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
      queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
    },
  });
};

export const useCredentialReject = () => {
  const queryClient = useQueryClient();
  const getCore = useGetONECore();
  return useMutation(
    async (interactionId: string) =>
      getCore()
        .holderRejectCredential(interactionId)
        .catch((err) => {
          if (err instanceof OneError && err.code === OneErrorCode.NotSupported) {
            return;
          }
          throw err;
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
  const getCore = useGetONECore();
  return useMutation(async (credentialIds: string[]) => getCore().checkRevocation(credentialIds), {
    onSuccess: () => {
      queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
      queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
    },
  });
};
