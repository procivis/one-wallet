import { useMemo } from 'react';
import ONE from 'react-native-one-core';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const LIST_QUERY_KEY = 'credential-list';

export const useCredentials = () => {
  return useQuery([LIST_QUERY_KEY], () => ONE.getCredentials(), {
    keepPreviousData: true,
  });
};

export const useCredential = (credentialId: string) => {
  const { data: credentials } = useCredentials();
  return useMemo(() => credentials?.find(({ id }) => id === credentialId), [credentialId, credentials]);
};

export const useInvitationHandler = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (invitationUrl: string) =>
      ONE.handleInvitation(invitationUrl).then(({ issuedCredentialId }) => issuedCredentialId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(LIST_QUERY_KEY);
      },
    },
  );
};
