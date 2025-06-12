import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useCloseButtonTimeout,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import {
  SettingsNavigationProp,
  SettingsRouteProp,
} from '../../navigators/settings/settings-routes';

const PinCodeSetScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeSet'>>();
  const route = useRoute<SettingsRouteProp<'PinCodeSet'>>();

  const rse = route.params?.rse === true;

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
        leftItem: (
          <HeaderCloseModalButton testID="PinCodeSetScreen.header.close" />
        ),
        modalHandleVisible: Platform.OS === 'ios',
      }}
      loader={{
        animate: false,
        label: translate(
          rse
            ? 'settings.security.rse.pinCodeSet.title'
            : 'settings.security.pinCodeSet.title',
        ),
        state: LoaderViewState.Success,
        testID: 'PinCodeSetScreen.animation',
      }}
      testID="PinCodeSetScreen"
    />
  );
};

export default PinCodeSetScreen;
