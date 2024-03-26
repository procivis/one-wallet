import { useQuery } from 'react-query';

import { useONECore } from './core-context';

const CONFIG_QUERY_KEY = 'config';

export const useCoreConfig = () => {
  const { core } = useONECore();

  return useQuery([CONFIG_QUERY_KEY], () => core?.getConfig(), {
    keepPreviousData: true,
  });
};
