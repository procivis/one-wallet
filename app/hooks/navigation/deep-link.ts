import {
  parseUniversalLink,
  reportException,
  useInitialDeepLinkHandling as useCommonInitialDeepLinkHandling,
  useONECore,
  useRuntimeDeepLinkHandling as useCommonRuntimeDeepLinkHandling,
} from '@procivis/one-react-native-components';
import { CredentialManager } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

import { config } from '../../config';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import {
  getCurrentRoute,
  RootNavigationStateUpdatedEvent,
} from '../../utils/navigation';
import { useIsOnboarded } from '../onboarded';

export const useRuntimeDeepLinkHandling = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const stateListener = useRef<(() => void) | undefined>(undefined);
  const handleInvitationUrl = useInvitationHandling();
  const isOnboarded = useIsOnboarded();

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
    Boolean(isOnboarded),
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
      if (
        config.signDocumentRedirectUri &&
        url.startsWith(config.signDocumentRedirectUri)
      ) {
        return;
      }
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

export const useDcApiCheck = () => {
  const { organisationId } = useONECore();
  const navigation = useNavigation<RootNavigationProp>();

  return useCallback(async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    return CredentialManager.checkDcApi({ organisationId })
      .then((request) => {
        if (request) {
          navigation.navigate('CredentialManagement', {
            params: {
              params: {
                request,
                preselectedCredentialIds: request.preselectedCredentialId
                  ? [request.preselectedCredentialId]
                  : undefined,
              },
              screen: 'ProofRequest',
            },
            screen: 'ShareCredential',
          });
        }

        return Boolean(request);
      })
      .catch((error) => {
        reportException(error, 'DC-API check failed');
        navigation.navigate('CredentialManagement', {
          params: {
            params: { error },
            screen: 'DcApiError',
          },
          screen: 'ShareCredential',
        });
      });
  }, [organisationId, navigation]);
};
