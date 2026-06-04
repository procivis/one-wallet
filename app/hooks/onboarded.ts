import { useONECore } from '@procivis/one-react-native-components';
import { useEffect, useState } from 'react';

import { useOnPinCodeInitialized } from './pin-code/pin-code';

export const useIsOnboarded = () => {
  const { core, organisationId } = useONECore();
  const [onboarded, setOnboarded] = useState<boolean | undefined>(undefined);

  useOnPinCodeInitialized(() => {
    setOnboarded(undefined);
  });

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
