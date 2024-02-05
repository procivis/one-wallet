import { useQuery } from 'react-query';

import { useONECore } from './core-context';
import { ONE_CORE_ORGANISATION_ID } from './core-init';

const CREDENTIAL_SCHEMA_LIST_QUERY_KEY = 'credential-schema-list';

export const useCredentialSchemas = () => {
  const { core } = useONECore();

  return useQuery(
    [CREDENTIAL_SCHEMA_LIST_QUERY_KEY],
    () =>
      core
        .getCredentialSchemas({
          organisationId: ONE_CORE_ORGANISATION_ID,
          page: 0,
          // TODO: workaround pagination for now, until it's supported by UI
          pageSize: 10000,
        })
        .then(({ values }) => values),
    {
      keepPreviousData: true,
    },
  );
};
