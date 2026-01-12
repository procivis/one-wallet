import {
  ButtonType,
  concatTestID,
  LoaderViewState,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useCredentialDetail,
  useCredentialRevocationCheck,
} from '@procivis/one-react-native-components';
import {
  CredentialDetailBindingDto,
  Ubiqu,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ProcessingView } from '../../components/common/processing-view';
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
    async (credentialDetail: CredentialDetailBindingDto) => {
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

  const button = useMemo(() => {
    switch (state) {
      case LoaderViewState.InProgress:
        return false;
      case LoaderViewState.Success:
        return {
          onPress: onClose,
          testID: concatTestID(testID, 'close'),
          title: translate('common.closeWithTimeout', {
            timeout: closeTimeout,
          }),
          type: ButtonType.Secondary,
        };
      default:
        return {
          onPress: onRetry,
          testID: concatTestID(testID, 'retry'),
          title: translate('common.retry'),
          type: ButtonType.Primary,
        };
    }
  }, [closeTimeout, onClose, onRetry, state]);

  return (
    <ProcessingView
      button={button}
      error={error}
      loaderLabel={translateError(
        error,
        translate(`credentialUpdateTitle.${state}`),
      )}
      onClose={undefined}
      state={state}
      testID={testID}
      title={translate('common.credentialUpdate')}
    />
  );
};

export default CredentialUpdateProcessScreen;
