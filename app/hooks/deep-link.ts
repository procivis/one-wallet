import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { RootNavigationProp } from '../navigators/root/root-navigator-routes';
import { reportTraceInfo } from '../utils/reporting';

export const useDeepLink = (enabled = true) => {
  const handleInvitationUrl = useInvitationHandling();

  const handleDeepLink = useCallback(
    (url: string) => {
      reportTraceInfo('Connection', 'Handling deep link');
      handleInvitationUrl(url);
    },
    [handleInvitationUrl],
  );

  const [deepLinkURL, setDeepLinkURL] = useState<string>();

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        setDeepLinkURL(url);
      }
    });
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => setDeepLinkURL(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!deepLinkURL || !enabled) return;
    handleDeepLink(deepLinkURL);
    setDeepLinkURL(undefined);
  }, [deepLinkURL, enabled, handleDeepLink]);
};

export const useInvitationHandling = () => {
  const navigation = useNavigation<RootNavigationProp>();

  return useCallback(
    (invitationUrl: string) => {
      navigation.navigate('Invitation', { screen: 'Processing', params: { invitationUrl } });
    },
    [navigation],
  );
};
