import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCloseButtonTimeout } from '../../hooks/navigation/close-button-timeout';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const PinCodeSetScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeChange'>>();

  const closeButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const { closeTimeout } = useCloseButtonTimeout(true, closeButtonHandler);

  return (
    <LoadingResultScreen
      button={{
        onPress: closeButtonHandler,
        testID: 'PinCodeSetScreen.close',
        title: translate('common.closeWithTimeout', {
          timeout: closeTimeout,
        }),
        type: ButtonType.Secondary,
      }}
      header={{
        leftItem: HeaderCloseModalButton,
        modalHandleVisible: Platform.OS === 'ios',
      }}
      loader={{
        animate: false,
        label: translate(`settings.security.pinCodeSet.title`),
        state: LoaderViewState.Success,
        testID: 'PinCodeSetScreen.animation',
      }}
      testID="PinCodeSetScreen"
    />
  );
};

export default PinCodeSetScreen;
