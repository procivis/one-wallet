import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { useCredentialDelete } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { RootNavigationProp, RootRouteProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

const CredentialDeleteProcessScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'CredentialDeleteProcessing'>>();
  const route = useRoute<RootRouteProp<'CredentialDeleteProcessing'>>();
  const [state, setState] = useState<
    LoadingResultState.InProgress | LoadingResultState.Success | LoadingResultState.Failure
  >(LoadingResultState.InProgress);
  const { credentialId } = route.params;
  const { mutateAsync: deleteCredential } = useCredentialDelete();

  useBlockOSBackNavigation();

  const handleCredentialDelete = useCallback(async () => {
    setState(LoadingResultState.InProgress);
    try {
      await deleteCredential(credentialId);
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Delete credential failure');
      setState(LoadingResultState.Failure);
    }
  }, [credentialId, deleteCredential]);

  useEffect(() => {
    handleCredentialDelete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = useCallback(() => {
    navigation.navigate('Tabs', { screen: 'Wallet' });
  }, [navigation]);

  return (
    <LoadingResult
      testID="CredentialDeleteProcessScreen"
      variation={LoadingResultVariation.Neutral}
      title={translate(`credentialDelete.${state}.title`)}
      subtitle={translate(`credentialDelete.${state}.subtitle`)}
      state={state}
      inProgressCloseButtonLabel={translate('common.cancel')}
      successCloseButtonLabel={translate('common.close')}
      failureCloseButtonLabel={translate('common.cancel')}
      retryButtonLabel={translate('common.retry')}
      onClose={onClose}
      onRetry={handleCredentialDelete}
    />
  );
};

export default CredentialDeleteProcessScreen;
