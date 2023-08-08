import { QueryClient } from 'react-query';

import { reportException } from '../utils/reporting';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      onError: (err) => {
        reportException(err, 'Query failure');
      },
    },
    mutations: {
      onError: (err) => {
        reportException(err, 'Mutation failure');
      },
    },
  },
});
