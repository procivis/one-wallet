import {
  ButtonProps,
  ButtonType,
  concatTestID,
  HeaderCloseButton,
  HeaderInfoButton,
  LoaderViewState,
  LoadingResultScreen,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
} from '@procivis/one-react-native-components';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { translate, translateError } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

export interface ProcessingViewProps {
  button?: ButtonProps | false;
  error?: unknown;
  loaderLabel: string;
  onClose: (() => void) | undefined;
  state: LoaderViewState;
  testID: string;
  title?: string;
}

export const ProcessingView: FunctionComponent<ProcessingViewProps> = ({
  button,
  testID,
  onClose,
  state,
  error,
  title,
  loaderLabel,
}) => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const isFocused = useIsFocused();
  const [initialState] = useState(state);

  const closing = useRef(false);
  const closeHandler = useCallback(() => {
    if (!closing.current) {
      closing.current = true;
      onClose?.();
    }
  }, [onClose]);

  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success,
    closeHandler,
  );

  const infoPressHandler = useCallback(() => {
    rootNavigation.navigate('NerdMode', {
      params: { error },
      screen: 'ErrorNerdMode',
    });
  }, [error, rootNavigation]);

  const androidBackHandler = useCallback(() => {
    if (state !== LoaderViewState.InProgress) {
      closeHandler();
    }
    return true;
  }, [closeHandler, state]);
  useBlockOSBackNavigation(true, androidBackHandler);

  return (
    <LoadingResultScreen
      button={
        button
          ? button
          : state === LoaderViewState.Success && button !== false && onClose
          ? {
              onPress: closeHandler,
              testID: concatTestID(testID, 'close'),
              title: translate('common.closeWithTimeout', {
                timeout: closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      header={{
        leftItem: (
          <HeaderCloseButton
            onPress={closeHandler}
            testID={concatTestID(testID, 'header.close')}
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning && error ? (
            <HeaderInfoButton
              accessibilityLabel={translate('accessibility.nav.info')}
              onPress={infoPressHandler}
              testID={concatTestID(testID, 'header.info')}
            />
          ) : undefined,
        title,
      }}
      loader={{
        animate: initialState === LoaderViewState.InProgress && isFocused,
        label: translateError(error, loaderLabel),
        state,
        testID: concatTestID(testID, 'animation'),
      }}
      testID={testID}
    />
  );
};
