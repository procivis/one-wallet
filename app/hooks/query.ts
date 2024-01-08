import { QueryClient } from 'react-query';

import { reportException } from '../utils/reporting';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (err) => {
        reportException(err, 'Mutation failure');
      },
    },
    queries: {
      onError: (err) => {
        reportException(err, 'Query failure');
      },
      staleTime: Infinity,
    },
  },
});
