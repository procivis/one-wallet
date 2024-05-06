import { useCallback, useState } from 'react';

export const useCredentialCardExpanded = () => {
  const [expanded, setExpanded] = useState(true);

  const onHeaderPress = useCallback(() => {
    setExpanded((oldValue) => !oldValue);
  }, []);

  return { expanded, onHeaderPress };
};

export const useCredentialListExpandedCard = () => {
  const [expandedCredential, setExpandedCredential] = useState<string>();

  const onHeaderPress = useCallback((credentialId?: string) => {
    if (!credentialId) {
      return;
    }
    setExpandedCredential((oldValue) => {
      if (credentialId === oldValue) {
        return undefined;
      }
      return credentialId;
    });
  }, []);

  const foldCards = useCallback(() => {
    setExpandedCredential(undefined);
  }, []);

  return { expandedCredential, foldCards, onHeaderPress };
};
