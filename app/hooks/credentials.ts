import { useMemo } from 'react';
import ONE, { InvitationResult } from 'react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const CREDENTIAL_LIST_QUERY_KEY = 'credential-list';

export const useCredentials = () => {
  return useQuery([CREDENTIAL_LIST_QUERY_KEY], () => ONE.getCredentials(), {
    keepPreviousData: true,
  });
};

export const useCredential = (credentialId: string) => {
  const { data: credentials } = useCredentials();
  return useMemo(() => credentials?.find(({ id }) => id === credentialId), [credentialId, credentials]);
};

export const useInvitationHandler = () => {
  const queryClient = useQueryClient();
  return useMutation(async (invitationUrl: string) => ONE.handleInvitation(invitationUrl), {
    onSuccess: (result: InvitationResult) => {
      if ('issuedCredentialId' in result) {
        queryClient.invalidateQueries(CREDENTIAL_LIST_QUERY_KEY);
      }
    },
  });
};
