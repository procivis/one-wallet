import {
  LoaderViewState,
  useBeforeRemove,
  useBlockOSBackNavigation,
  useCredentialDelete,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { translate, translateError } from '../../i18n';
import { DeleteCredentialRouteProp } from '../../navigators/delete-credential/delete-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const CredentialDeleteProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetailBindingDto'>>();
  const route = useRoute<DeleteCredentialRouteProp<'Processing'>>();
  const [error, setError] = useState<unknown>();

  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const { credentialId } = route.params;
  const { mutateAsync: deleteCredential } = useCredentialDelete();

  useBlockOSBackNavigation(state === LoaderViewState.InProgress);

  const handleCredentialDelete = useCallback(async () => {
    setState(LoaderViewState.InProgress);
    try {
      await deleteCredential(credentialId);
      setState(LoaderViewState.Success);
    } catch (e) {
      setState(LoaderViewState.Warning);
      setError(e);
    }
  }, [credentialId, deleteCredential]);

  useEffect(() => {
    handleCredentialDelete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closing = useRef(false);
  const onClose = useCallback(() => {
    closing.current = true;
    rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);
  useBeforeRemove(() => {
    if (!closing.current) {
      onClose();
    }
  });

  return (
    <ProcessingView
      error={error}
      loaderLabel={translateError(
        error,
        translate(`credentialDeleteTitle.${state}`),
      )}
      onClose={onClose}
      state={state}
      testID="CredentialDeleteProcessScreen"
      title={translate('common.credentialDeletion')}
    />
  );
};

export default CredentialDeleteProcessScreen;
