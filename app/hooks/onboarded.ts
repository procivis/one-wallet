import { useONECore } from '@procivis/one-react-native-components';
import { useEffect, useState } from 'react';

export const useIsOnboarded = () => {
  const { core, organisationId } = useONECore();
  const [onboarded, setOnboarded] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    if (onboarded !== undefined) {
      return;
    }
    core
      .getOrganisation(organisationId)
      .then(() => {
        setOnboarded(true);
      })
      .catch(() => {
        setOnboarded(false);
      });
  }, [core, onboarded, organisationId]);

  return onboarded;
};
