import { HistoryListQuery } from '@procivis/react-native-one-core';
import { useInfiniteQuery } from 'react-query';

import { getQueryKeyFromListQueryParams } from '../utils/history';
import { useONECore } from './core-context';
import { ONE_CORE_ORGANISATION_ID } from './core-init';

const PAGE_SIZE = 20;
export const HISTORY_LIST_QUERY_KEY = 'history-list';

export const useHistory = (extraQueryParams?: Partial<HistoryListQuery>) => {
  const { core } = useONECore();

  const queryParams = {
    organisationId: ONE_CORE_ORGANISATION_ID,
    pageSize: PAGE_SIZE,
    ...extraQueryParams,
  };

  return useInfiniteQuery(
    [HISTORY_LIST_QUERY_KEY, ...getQueryKeyFromListQueryParams(queryParams)],
    async ({ pageParam = 0 }) =>
      core.getHistory({ ...queryParams, page: pageParam }),
    {
      getNextPageParam: (lastPage, allPages) =>
        allPages.length < lastPage.totalPages ? allPages.length : undefined,
      keepPreviousData: true,
    },
  );
};
