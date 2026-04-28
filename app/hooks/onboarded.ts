import { useONECore } from '@procivis/one-react-native-components';
import { useEffect, useState } from 'react';

let globalOnboarded: boolean | undefined;
export const useIsOnboarded = () => {
  const { core, organisationId } = useONECore();
  const [onboarded, setOnboarded] = useState<boolean | undefined>(
    globalOnboarded,
  );
  useEffect(() => {
    if (globalOnboarded !== undefined) {
      return;
    }
    core
      .listIdentifiers({
        organisationId,
        page: 0,
        pageSize: 2,
      })
      .then((identifiers) => {
        setOnboarded(identifiers.totalItems > 0);
        globalOnboarded = identifiers.totalItems > 0;
      });
  }, [core, organisationId]);

  return onboarded;
};

export const resetOnboarding = () => {
  globalOnboarded = false;
};
