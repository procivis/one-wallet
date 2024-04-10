import {
  CredentialListItem,
  CredentialStateEnum,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';

import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';
import {
  useCredentialRevocationCheck,
  useCredentials,
} from '../core/credentials';

/**
 * Runs revocation check on background for all potential updates
 *
 * Navigates to the result page if some credential states were updated
 */
export const useCredentialStatusCheck = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { mutateAsync: check } = useCredentialRevocationCheck();
  const { data: credentials } = useCredentials({
    status: [CredentialStateEnum.ACCEPTED, CredentialStateEnum.SUSPENDED],
  });

  const runCheck = useCallback(
    async (checkedCredentials: CredentialListItem[]) => {
      if (!checkedCredentials.length) {
        return;
      }

      const results = await check(checkedCredentials.map(({ id }) => id)).catch(
        (e) => {
          reportException(e, 'Revocation check failed');
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
        navigation.navigate('CredentialManagement', {
          params: { credentialIds: updatedCredentialIds },
          screen: 'StatusCheckResult',
        });
      }
    },
    [check, navigation],
  );

  const isFocused = useIsFocused();
  const checkDone = useRef(false);

  useEffect(() => {
    if (!checkDone.current && credentials && isFocused) {
      checkDone.current = true;
      runCheck(credentials);
    }
  }, [credentials, isFocused, runCheck]);
};
