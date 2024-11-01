import {
  useInitialDeepLinkHandling as useCommonInitialDeepLinkHandling,
  useRuntimeDeepLinkHandling as useCommonRuntimeDeepLinkHandling,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { RootNavigationProp } from '../../navigators/root/root-routes';
import { usePinCodeInitialized } from '../pin-code/pin-code';

export const useRuntimeDeepLinkHandling = () => {
  const handleInvitationUrl = useInvitationHandling();
  const pinInitialized = usePinCodeInitialized();
  useCommonRuntimeDeepLinkHandling(
    Boolean(pinInitialized),
    handleInvitationUrl,
  );
};

export const useInitialDeepLinkHandling = () => {
  const handleInvitationUrl = useInvitationHandling();
  return useCommonInitialDeepLinkHandling(handleInvitationUrl);
};

export const useInvitationHandling = () => {
  const navigation = useNavigation<RootNavigationProp>();

  return useCallback(
    (invitationUrl: string) => {
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
