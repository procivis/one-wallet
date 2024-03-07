import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useCredentialDelete } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { CredentialDetailRouteProp } from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const CredentialDeleteProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const route = useRoute<CredentialDetailRouteProp<'DeleteProcessing'>>();
  const [state, setState] = useState<
    | LoadingResultState.InProgress
    | LoadingResultState.Success
    | LoadingResultState.Failure
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
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('common.cancel')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onClose={onClose}
      onRetry={handleCredentialDelete}
      retryButtonLabel={translate('common.retry')}
      state={state}
      subtitle={translate(`credentialDelete.${state}.subtitle`)}
      successCloseButtonLabel={translate('common.close')}
      testID="CredentialDeleteProcessScreen"
      title={translate(`credentialDelete.${state}.title`)}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default CredentialDeleteProcessScreen;
