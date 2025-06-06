import {
  reportTraceInfo,
  useCredentialRevocationCheck,
  useCredentials,
} from '@procivis/one-react-native-components';
import {
  CredentialListItem,
  CredentialStateEnum,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import RNBootSplash from 'react-native-bootsplash';

import { RootNavigationProp } from '../../navigators/root/root-routes';

/**
 * Runs revocation check on background for all potential updates
 *
 * Navigates to the result page if some credential states were updated
 * @param {string[]} credentialIds if specified only those credentials get checked, otherwise all potentially eligible credentials
 */
export const useCredentialStatusCheck = (credentialIds?: string[]) => {
  const navigation = useNavigation<RootNavigationProp>();
  const { mutateAsync: check } = useCredentialRevocationCheck(false);
  const { data: credentials } = useCredentials({
    ids: credentialIds,
    status: [CredentialStateEnum.ACCEPTED, CredentialStateEnum.SUSPENDED],
  });

  const runCheck = useCallback(
    async (checkedCredentials: CredentialListItem[]) => {
      if (!checkedCredentials.length) {
        return;
      }

      const results = await check(checkedCredentials.map(({ id }) => id)).catch(
        (e: Error) => {
          reportTraceInfo('Wallet', 'Credential status check failed', e);
          return [];
        },
      );

      const updatedCredentialIds = results
        .filter(
          ({ credentialId, status: newStatus, success }) =>
            success &&
            checkedCredentials.find(({ id }) => id === credentialId)?.state !==
              newStatus,
        )
        .map(({ credentialId }) => credentialId);

      if (updatedCredentialIds.length && navigation.isFocused()) {
        navigation.navigate('StatusCheckResult', {
          credentialIds: updatedCredentialIds,
        });
      }
    },
    [check, navigation],
  );

  const isFocused = useIsFocused();
  const checkDone = useRef(false);

  useEffect(() => {
    if (!checkDone.current && credentials && isFocused) {
      RNBootSplash.isVisible().then((visible) => {
        if (!visible) {
          checkDone.current = true;
          runCheck(credentials);
        }
      });
    }
  }, [credentials, isFocused, runCheck]);
};
