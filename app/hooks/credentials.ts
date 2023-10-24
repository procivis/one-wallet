import ONE, { CredentialStateEnum, InvitationResult } from 'react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useStores } from '../models';
import { ONE_CORE_ORGANISATION_ID } from './core-init';

const CREDENTIAL_LIST_QUERY_KEY = 'credential-list';
const CREDENTIAL_DETAIL_QUERY_KEY = 'credential-detail';

export const useCredentials = () => {
  return useQuery(
    [CREDENTIAL_LIST_QUERY_KEY],
    () =>
      ONE.getCredentials({
        page: 0,
        // TODO: workaround pagination for now, until it's supported by UI
        pageSize: 10000,
        organisationId: ONE_CORE_ORGANISATION_ID,
      }).then(({ values }) =>
        values.filter(({ state }) => state === CredentialStateEnum.ACCEPTED || state === CredentialStateEnum.REVOKED),
      ),
    {
      keepPreviousData: true,
    },
  );
};

export const useCredentialDetail = (credentialId: string | undefined) => {
  return useQuery(
    [CREDENTIAL_DETAIL_QUERY_KEY, credentialId],
    () => (credentialId ? ONE.getCredential(credentialId) : undefined),
    {
      keepPreviousData: true,
      enabled: Boolean(credentialId),
    },
  );
};

export const useInvitationHandler = () => {
  const queryClient = useQueryClient();
  const { walletStore } = useStores();
  return useMutation(async (invitationUrl: string) => ONE.handleInvitation(invitationUrl, walletStore.holderDidId), {
    onSuccess: (result: InvitationResult) => {
      if ('credentialIds' in result) {
        queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
      }
    },
  });
};

export const useCredentialAccept = () => {
  const queryClient = useQueryClient();
  return useMutation(async (interactionId: string) => ONE.holderAcceptCredential(interactionId), {
    onSuccess: () => {
      queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
      queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
    },
  });
};

export const useCredentialReject = () => {
  const queryClient = useQueryClient();
  return useMutation(async (interactionId: string) => ONE.holderRejectCredential(interactionId), {
    onSuccess: () => {
      queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
      queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
    },
  });
};

export const useCredentialRevocationCheck = () => {
  const queryClient = useQueryClient();
  return useMutation(async (credentialIds: string[]) => ONE.checkRevocation(credentialIds), {
    onSuccess: () => {
      queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
      queryClient.invalidateQueries(CREDENTIAL_DETAIL_QUERY_KEY);
    },
  });
};
