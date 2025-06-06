import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBeforeRemove,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
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
import { Platform } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { translate, translateError } from '../../i18n';
import { DeleteCredentialRouteProp } from '../../navigators/delete-credential/delete-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const CredentialDeleteProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
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

  const infoPressHandler = useCallback(() => {
    if (!error) {
      return;
    }
    rootNavigation.navigate('NerdMode', {
      params: { error },
      screen: 'ErrorNerdMode',
    });
  }, [error, rootNavigation]);

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
        leftItem: (
          <HeaderCloseModalButton
            onPress={onClose}
            testID="CredentialDeleteProcessScreen.header.close"
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID="CredentialDeleteProcessScreen.header.info"
            />
          ) : undefined,
        title: translate('credentialDelete.title'),
      }}
      loader={{
        animate: true,
        label: translateError(
          error,
          translate(`credentialDelete.${state}.title`),
        ),
        state,
        testID: 'CredentialDeleteProcessScreen.animation',
      }}
      testID="CredentialDeleteProcessScreen"
    />
  );
};

export default CredentialDeleteProcessScreen;
