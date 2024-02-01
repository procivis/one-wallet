import { useQuery } from 'react-query';

import { groupEntriesByMonth } from '../utils/history';
import { useONECore } from './core-context';
import { ONE_CORE_ORGANISATION_ID } from './core-init';

const HISTORY_LIST_QUERY_KEY = 'history-list';

export const useHistory = () => {
  const { core } = useONECore();

  return useQuery(
    [HISTORY_LIST_QUERY_KEY],
    () =>
      core
        .getHistory({
          organisationId: ONE_CORE_ORGANISATION_ID,
          page: 0,
          // TODO: workaround pagination for now, until it's supported by UI
          pageSize: 10000,
        })
        .then(({ values }) => groupEntriesByMonth(values)),
    {
      keepPreviousData: true,
    },
  );
};
