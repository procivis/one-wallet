import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useCredentialDetail,
  useCredentialRevocationCheck,
} from '@procivis/one-react-native-components';
import { CredentialDetail, Ubiqu } from '@procivis/react-native-one-core';
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
import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const {
  addEventListener: addRSEEventListener,
  PinEventType,
  PinFlowType,
} = Ubiqu;

const CredentialUpdateProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const route = useRoute<RootRouteProp<'CredentialUpdateProcess'>>();
  const { credentialId } = route.params;
  const [error, setError] = useState<unknown>();
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const closing = useRef(false);

  useBlockOSBackNavigation(state === LoaderViewState.InProgress);

  useEffect(
    () =>
      addRSEEventListener((event) => {
        if (
          event.type === PinEventType.SHOW_PIN &&
          event.flowType === PinFlowType.TRANSACTION
        ) {
          rootNavigation.navigate('RSESign');
        }
      }),
    [rootNavigation],
  );

  const { mutateAsync: checkCredentialStatus } =
    useCredentialRevocationCheck(true);
  const { data: credential } = useCredentialDetail(credentialId);

  const [credentialStateUpdated, setCredentialStateUpdated] =
    useState<boolean>(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  const handleCheckCredentialStatus = useCallback(
    async (credentialDetail: CredentialDetail) => {
      try {
        const checkResult = (
          await checkCredentialStatus([credentialDetail.id])
        )[0];

        if (!checkResult.success) {
          throw new Error(checkResult.reason);
        }

        if (checkResult.status !== credentialDetail.state) {
          setCredentialStateUpdated(true);
        }

        setState(LoaderViewState.Success);
      } catch (e) {
        setState(LoaderViewState.Warning);
        setError(e);
      }
    },
    [setCredentialStateUpdated, setState, setError, checkCredentialStatus],
  );

  useEffect(() => {
    if (credential && !hasCheckedStatus) {
      setState(LoaderViewState.InProgress);
      setHasCheckedStatus(true);
      handleCheckCredentialStatus(credential);
    }
  }, [
    credential,
    handleCheckCredentialStatus,
    hasCheckedStatus,
    setHasCheckedStatus,
  ]);

  const onRetry = useCallback(() => {
    setState(LoaderViewState.InProgress);
    setHasCheckedStatus(false);
  }, []);

  const onClose = useCallback(() => {
    closing.current = true;

    if (credentialStateUpdated) {
      resetNavigationAction(rootNavigation, [
        {
          name: 'CredentialDetail',
          params: { params: { credentialId }, screen: 'Detail' },
        },
        {
          name: 'StatusCheckResult',
          params: { credentialIds: [credentialId] },
        },
      ]);
    } else {
      rootNavigation.navigate('CredentialDetail', {
        params: { credentialId },
        screen: 'Detail',
      });
    }
  }, [rootNavigation, credentialStateUpdated, credentialId]);

  useEffect(() => {
    if (credentialStateUpdated) {
      onClose();
    }
  }, [credentialStateUpdated, onClose]);

  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success && !credentialStateUpdated,
    onClose,
  );

  return (
    <LoadingResultScreen
      button={
        credentialStateUpdated || state === LoaderViewState.InProgress
          ? undefined
          : state === LoaderViewState.Success && !credentialStateUpdated
          ? {
              onPress: onClose,
              testID: 'CredentialUpdateProcessScreen.close',
              title: translate('common.closeWithTimeout', {
                timeout: credentialStateUpdated ? 0 : closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : {
              onPress: onRetry,
              testID: 'CredentialUpdateProcessScreen.retry',
              title: translate('common.retry'),
              type: ButtonType.Primary,
            }
      }
      header={{
        leftItem: (
          <HeaderCloseModalButton
            onPress={onClose}
            testID="CredentialUpdateProcessScreen.header.close"
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton
              onPress={() => {
                if (error) {
                  rootNavigation.navigate('NerdMode', {
                    params: { error },
                    screen: 'ErrorNerdMode',
                  });
                }
              }}
              testID="CredentialUpdateProcessScreen.header.info"
            />
          ) : undefined,
        title: translate('credentialUpdate.title'),
      }}
      loader={{
        animate: true,
        label: translateError(
          error,
          translate(`credentialUpdate.process.${state}.title`),
        ),
        state,
        testID: 'CredentialUpdateProcessScreen.animation',
      }}
      testID="CredentialUpdateProcessScreen"
    />
  );
};

export default CredentialUpdateProcessScreen;
