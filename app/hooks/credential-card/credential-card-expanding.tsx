import { useCallback, useState } from 'react';

export const useCredentialOfferSelectedCards = () => {
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  const onHeaderPress = useCallback((credentialId?: string) => {
    if (!credentialId) {
      return;
    }
    setInitialized(true);
    setSelectedCredentials((oldValue) => {
      if (oldValue.includes(credentialId)) {
        return oldValue.filter((id) => id !== credentialId);
      }
      return [...oldValue, credentialId];
    });
  }, []);

  const setInitialSelection = useCallback(
    (credentialIds: string[]) => {
      if (!initialized) {
        setSelectedCredentials(credentialIds);
      }
      setInitialized(true);
    },
    [initialized],
  );

  return { onHeaderPress, selectedCredentials, setInitialSelection };
};
