import {
  parseUniversalLink,
  useInitialDeepLinkHandling as useCommonInitialDeepLinkHandling,
  useRuntimeDeepLinkHandling as useCommonRuntimeDeepLinkHandling,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

import { config } from '../../config';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import {
  getCurrentRoute,
  RootNavigationStateUpdatedEvent,
} from '../../utils/navigation';
import { usePinCodeInitialized } from '../pin-code/pin-code';

export const useRuntimeDeepLinkHandling = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const stateListener = useRef<(() => void) | undefined>(undefined);
  const handleInvitationUrl = useInvitationHandling();
  const pinInitialized = usePinCodeInitialized();

  const handleRuntimeInvitationLink = useCallback(
    (url: string) => {
      const currentRoute = getCurrentRoute(navigation.getState?.() || {});

      if (
        config.requestCredentialRedirectUri &&
        url.startsWith(config.requestCredentialRedirectUri)
      ) {
        // We return here in order to continue the Request credential flow in request-credential-list-screen.tsx
        return;
      }

      if (currentRoute !== 'PinCodeCheck') {
        handleInvitationUrl(url);
        return;
      }

      stateListener.current?.();
      stateListener.current = navigation.addListener(
        'state',
        (e: RootNavigationStateUpdatedEvent) => {
          const currentStateRoute = getCurrentRoute(e.data.state);
          if (currentStateRoute === 'PinCodeCheck') {
            return;
          }
          handleInvitationUrl(url);
          stateListener.current?.();
          stateListener.current = undefined;
        },
      );
    },
    [handleInvitationUrl, navigation],
  );

  useCommonRuntimeDeepLinkHandling(
    Boolean(pinInitialized),
    handleRuntimeInvitationLink,
  );
};

export const useInitialDeepLinkHandling = () => {
  const handleInvitationUrl = useInvitationHandling();
  return useCommonInitialDeepLinkHandling(handleInvitationUrl);
};

export const useInvitationHandling = () => {
  const navigation = useNavigation<RootNavigationProp>();

  return useCallback(
    (url: string) => {
      const invitationUrl = parseUniversalLink(url) ?? url;

      navigation.navigate('CredentialManagement', {
        params: {
          params: { invitationUrl },
          screen: 'Processing',
        },
        screen: 'Invitation',
      });
    },
    [navigation],
  );
};
