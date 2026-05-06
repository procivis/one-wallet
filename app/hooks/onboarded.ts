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
      .getOrganisation(organisationId)
      .then(() => {
        setOnboarded(true);
        globalOnboarded = true;
      })
      .catch(() => {
        setOnboarded(false);
        globalOnboarded = false;
      });
  }, [core, organisationId]);

  return onboarded;
};

export const resetOnboarding = () => {
  globalOnboarded = false;
};
