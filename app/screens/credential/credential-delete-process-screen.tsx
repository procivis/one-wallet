import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCredentialDelete } from '../../hooks/core/credentials';
import { useBeforeRemove } from '../../hooks/navigation/before-remove';
import { useCloseButtonTimeout } from '../../hooks/navigation/close-button-timeout';
import { translate } from '../../i18n';
import { DeleteCredentialRouteProp } from '../../navigators/delete-credential/delete-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const CredentialDeleteProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const route = useRoute<DeleteCredentialRouteProp<'Processing'>>();

  const [state, setState] = useState(LoaderViewState.InProgress);
  const { credentialId } = route.params;
  const { mutateAsync: deleteCredential } = useCredentialDelete();

  useBlockOSBackNavigation(state === LoaderViewState.InProgress);

  const handleCredentialDelete = useCallback(async () => {
    setState(LoaderViewState.InProgress);
    try {
      await deleteCredential(credentialId);
      setState(LoaderViewState.Success);
    } catch (e) {
      reportException(e, 'Delete credential failure');
      setState(LoaderViewState.Warning);
    }
  }, [credentialId, deleteCredential]);

  useEffect(() => {
    handleCredentialDelete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closing = useRef(false);
  const onClose = useCallback(() => {
    closing.current = true;
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);
  useBeforeRemove(() => {
    if (!closing.current) {
      onClose();
    }
  });
  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success,
    onClose,
  );

  return (
    <LoadingResultScreen
      button={
        state === LoaderViewState.Success
          ? {
              onPress: onClose,
              testID: 'CredentialDeleteProcessScreen.close',
              title: translate('common.closeWithTimeout', {
                timeout: closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      header={{
        leftItem: <HeaderCloseModalButton onPress={onClose} />,
        modalHandleVisible: Platform.OS === 'ios',
        title: translate('credentialDelete.title'),
      }}
      loader={{
        animate: true,
        label: translate(`credentialDelete.${state}.title`),
        state,
      }}
      testID="CredentialDeleteProcessScreen"
    />
  );
};

export default CredentialDeleteProcessScreen;
