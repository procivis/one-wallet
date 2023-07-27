import { useMemoAsync } from '@procivis/react-native-components';
import { DependencyList, useMemo } from 'react';
import ONE from 'react-native-one-core';

export const useCredentials = (deps: DependencyList = []) => {
  return useMemoAsync(() => ONE.getCredentials(), deps);
};

export const useCredential = (credentialId: string, additionalDeps: DependencyList = []) => {
  const credentials = useCredentials(additionalDeps);
  return useMemo(() => credentials?.find(({ id }) => id === credentialId), [credentialId, credentials]);
};
