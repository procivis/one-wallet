import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { RootNavigationProp } from '../navigators/root/root-routes';
import { reportException, reportTraceInfo } from '../utils/reporting';

export const useRuntimeDeepLinkHandling = (enabled: boolean) => {
  const handleInvitationUrl = useInvitationHandling();

  const [deepLinkURL, setDeepLinkURL] = useState<string>();
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      reportTraceInfo('Connection', 'Runtime deep link');
      setDeepLinkURL(url);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (deepLinkURL && enabled) {
      setDeepLinkURL(undefined);
      handleInvitationUrl(deepLinkURL);
    }
  }, [deepLinkURL, enabled, handleInvitationUrl]);
};

let initialDeepLinkHandled = false;
export const useInitialDeepLinkHandling = () => {
  const handleInvitationUrl = useInvitationHandling();

  return useCallback(() => {
    if (!initialDeepLinkHandled) {
      Linking.getInitialURL()
        .then((url) => {
          initialDeepLinkHandled = true;
          if (url) {
            reportTraceInfo('Connection', 'Initial deep link');
            handleInvitationUrl(url);
          }
        })
        .catch((e) => reportException(e, 'Failed to get initial deep link'));
    }
  }, [handleInvitationUrl]);
};

export const useInvitationHandling = () => {
  const navigation = useNavigation<RootNavigationProp>();

  return useCallback(
    (invitationUrl: string) => {
      navigation.navigate('Invitation', {
        params: { invitationUrl },
        screen: 'Processing',
      });
    },
    [navigation],
  );
};
