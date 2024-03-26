import {
  formatDateTime,
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { CredentialStateEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import {
  useCredentialDetail,
  useCredentialRevocationCheck,
  useInvalidateCredentialDetails,
} from '../../hooks/credentials';
import { translate, TxKeyPath } from '../../i18n';
import { CredentialDetailRouteProp } from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const CredentialValidityProcessingScreen: FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<CredentialDetailRouteProp<'ValidityProcessing'>>();
  const [state, setState] = useState<
    | LoadingResultState.InProgress
    | LoadingResultState.Success
    | LoadingResultState.Failure
    | LoadingResultState.Error
  >(LoadingResultState.InProgress);
  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);
  const invalidateCredentialDetails = useInvalidateCredentialDetails();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();

  useBlockOSBackNavigation();

  const handleCredentialValidityCheck = useCallback(async () => {
    try {
      const [{ status }] = await checkRevocation([credentialId]);
      if (
        [CredentialStateEnum.REVOKED, CredentialStateEnum.SUSPENDED].includes(
          status,
        )
      ) {
        await invalidateCredentialDetails(credentialId);
        setState(LoadingResultState.Error);
        return;
      }
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Credential revocation check failure');
      setState(LoadingResultState.Failure);
    }
  }, [checkRevocation, credentialId, invalidateCredentialDetails, setState]);

  useEffect(() => {
    handleCredentialValidityCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = useCallback(() => {
    navigation.navigate('CredentialDetail', {
      params: { credentialId },
      screen: 'Detail',
    });
  }, [navigation, credentialId]);

  const getTranslation = useCallback(
    (key: string): string => {
      if (credential?.state === CredentialStateEnum.SUSPENDED) {
        if (credential.suspendEndDate) {
          return translate(
            `credentialValidity.${state}.suspendedUntil.${key}` as TxKeyPath,
            {
              date: formatDateTime(new Date(credential.suspendEndDate)),
            },
          );
        }

        return translate(
          `credentialValidity.${state}.suspended.${key}` as TxKeyPath,
        );
      }

      if (credential?.state === CredentialStateEnum.REVOKED) {
        return translate(
          `credentialValidity.${state}.revoked.${key}` as TxKeyPath,
        );
      }

      return translate(`credentialValidity.${state}.${key}` as TxKeyPath);
    },
    [credential, state],
  );

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onClose={onClose}
      state={state}
      subtitle={getTranslation('subtitle')}
      successCloseButtonLabel={translate('common.close')}
      testID="CredentialValidityProcessingScreen"
      title={getTranslation('title')}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default CredentialValidityProcessingScreen;
