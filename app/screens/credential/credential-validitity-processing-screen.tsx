import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { CredentialStateEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { useCredentialRevocationCheck } from '../../hooks/credentials';
import { translate, TxKeyPath } from '../../i18n';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { reportException } from '../../utils/reporting';

const CredentialValidityProcessingScreen: FC = () => {
  const navigation = useNavigation<CredentialDetailNavigationProp<'Detail'>>();
  const route = useRoute<CredentialDetailRouteProp<'ValidityProcessing'>>();
  const [state, setState] = useState<
    | LoadingResultState.InProgress
    | LoadingResultState.Success
    | LoadingResultState.Failure
    | LoadingResultState.Error
  >(LoadingResultState.InProgress);
  const { credentialId } = route.params;
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();

  useBlockOSBackNavigation();

  const handleCredentialRevocationCheck = useCallback(async () => {
    try {
      const [{ status }] = await checkRevocation([credentialId]);
      if (status === CredentialStateEnum.REVOKED) {
        setState(LoadingResultState.Error);
        return;
      }
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Credential revocation check failure');
      setState(LoadingResultState.Failure);
    }
  }, [checkRevocation, credentialId, setState]);

  useEffect(() => {
    handleCredentialRevocationCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = useCallback(() => {
    navigation.navigate('Detail', { credentialId });
  }, [credentialId, navigation]);

  const getTranslationKey = useCallback(
    (key: string): TxKeyPath => {
      if (state === LoadingResultState.Error) {
        return `credentialValidity.${state}.revoked.${key}` as TxKeyPath;
      }
      return `credentialValidity.${state}.${key}` as TxKeyPath;
    },
    [state],
  );

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onClose={onClose}
      state={state}
      subtitle={translate(getTranslationKey('subtitle'))}
      successCloseButtonLabel={translate('common.close')}
      testID="CredentialValidityProcessingScreen"
      title={translate(getTranslationKey('title'))}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default CredentialValidityProcessingScreen;
