import { HistoryListQuery } from '@procivis/react-native-one-core';
import { useQuery } from 'react-query';

import {
  getQueryKeyFromListQueryParams,
  groupEntriesByMonth,
} from '../utils/history';
import { useONECore } from './core-context';
import { ONE_CORE_ORGANISATION_ID } from './core-init';

const HISTORY_LIST_QUERY_KEY = 'history-list';

export const useHistory = (extraQueryParams?: Partial<HistoryListQuery>) => {
  const { core } = useONECore();

  const queryParams = {
    organisationId: ONE_CORE_ORGANISATION_ID,
    page: 0,
    // TODO: workaround pagination for now, until it's supported by UI
    pageSize: 10000,
    ...extraQueryParams,
  };

  return useQuery(
    [HISTORY_LIST_QUERY_KEY, ...getQueryKeyFromListQueryParams(queryParams)],
    async () => {
      return core
        .getHistory(queryParams)
        .then(({ values }) => groupEntriesByMonth(values));
    },
    { keepPreviousData: true },
  );
};
