import {
  ButtonType,
  concatTestID,
  LoaderViewState,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useCredentialRefresh,
} from '@procivis/one-react-native-components';
import { Ubiqu } from '@procivis/react-native-one-core';
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

const CredentialRefreshScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'CredentialRefresh'>>();
  const route = useRoute<RootRouteProp<'CredentialRefresh'>>();
  const { interactionId } = route.params;
  const [refreshed, setRefreshed] = useState(false);
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

  const { mutateAsync: refreshCredential } = useCredentialRefresh();

  const runRefresh = useCallback(async () => {
    try {
      setState(LoaderViewState.InProgress);

      await refreshCredential(interactionId);

      if (!navigation.isFocused()) {
        return;
      }

      setState(LoaderViewState.Success);
    } catch (e) {
      setState(LoaderViewState.Warning);
      setError(e);
    }
  }, [interactionId, navigation, refreshCredential]);

  useEffect(() => {
    if (refreshed) {
      return;
    }
    setRefreshed(true);
    runRefresh();
  }, [refreshed, runRefresh]);

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success,
    onClose,
  );

  const testID = 'CredentialRefreshScreen';

  const button = useMemo(() => {
    switch (state) {
      case LoaderViewState.Success:
        return {
          onPress: onClose,
          testID: concatTestID(testID, 'close'),
          title: translate('common.closeWithTimeout', {
            timeout: closeTimeout,
          }),
          type: ButtonType.Secondary,
        };
      case LoaderViewState.Warning:
        return {
          onPress: onClose,
          testID: concatTestID(testID, 'close'),
          title: translate('common.close'),
          type: ButtonType.Secondary,
        };
      default:
        return false;
    }
  }, [closeTimeout, onClose, state]);

  return (
    <ProcessingView
      button={button}
      error={error}
      loaderLabel={translateError(
        error,
        translate(`credentialRefreshTitle.${state}`),
      )}
      onClose={navigation.goBack}
      state={state}
      testID={testID}
      title={translate('common.refreshCredential')}
    />
  );
};

export default CredentialRefreshScreen;
