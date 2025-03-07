import {
  ButtonType,
  concatTestID,
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

const {
  addEventListener: addRSEEventListener,
  PinEventType,
  PinFlowType,
} = Ubiqu;

const CredentialUpdateProcessScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const route = useRoute<RootRouteProp<'CredentialUpdateProcess'>>();
  const { credentialId } = route.params;
  const [error, setError] = useState<unknown>();
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);

  useBlockOSBackNavigation(state === LoaderViewState.InProgress);

  useEffect(
    () =>
      addRSEEventListener((event) => {
        if (
          event.type === PinEventType.SHOW_PIN &&
          event.flowType === PinFlowType.TRANSACTION
        ) {
          navigation.navigate('RSESign');
        }
      }),
    [navigation],
  );

  const { mutateAsync: checkCredentialStatus } =
    useCredentialRevocationCheck(true);
  const { data: credential } = useCredentialDetail(credentialId);

  const runStatusCheck = useCallback(
    async (credentialDetail: CredentialDetail) => {
      try {
        setState(LoaderViewState.InProgress);

        const credentialIds = [credentialDetail.id];
        const checkResult = (await checkCredentialStatus(credentialIds))[0];

        if (!navigation.isFocused()) {
          return;
        }

        if (!checkResult.success) {
          throw new Error(checkResult.reason);
        }

        if (checkResult.status === credentialDetail.state) {
          setState(LoaderViewState.Success);
        } else {
          navigation.replace('StatusCheckResult', { credentialIds });
        }
      } catch (e) {
        setState(LoaderViewState.Warning);
        setError(e);
      }
    },
    [checkCredentialStatus, navigation],
  );

  useEffect(() => {
    if (credential) {
      runStatusCheck(credential);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!credential, runStatusCheck]);

  const onRetry = useCallback(() => {
    if (credential) {
      runStatusCheck(credential);
    }
  }, [credential, runStatusCheck]);

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success,
    onClose,
  );
  const testID = 'CredentialUpdateProcessScreen';
  return (
    <LoadingResultScreen
      button={
        state === LoaderViewState.InProgress
          ? undefined
          : state === LoaderViewState.Success
          ? {
              onPress: onClose,
              testID: concatTestID(testID, 'close'),
              title: translate('common.closeWithTimeout', {
                timeout: closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : {
              onPress: onRetry,
              testID: concatTestID(testID, 'retry'),
              title: translate('common.retry'),
              type: ButtonType.Primary,
            }
      }
      header={{
        leftItem: (
          <HeaderCloseModalButton
            onPress={onClose}
            testID={concatTestID(testID, 'header.close')}
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning && error ? (
            <HeaderInfoButton
              onPress={() => {
                navigation.navigate('NerdMode', {
                  params: { error },
                  screen: 'ErrorNerdMode',
                });
              }}
              testID={concatTestID(testID, 'header.info')}
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
        testID: concatTestID(testID, 'animation'),
      }}
      testID={testID}
    />
  );
};

export default CredentialUpdateProcessScreen;
