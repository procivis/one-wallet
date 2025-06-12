import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useCloseButtonTimeout,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const CacheClearedScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeChange'>>();

  const closeButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const { closeTimeout } = useCloseButtonTimeout(true, closeButtonHandler);

  return (
    <LoadingResultScreen
      button={{
        onPress: closeButtonHandler,
        testID: 'CacheClearedScreen.close',
        title: translate('common.closeWithTimeout', {
          timeout: closeTimeout,
        }),
        type: ButtonType.Secondary,
      }}
      header={{
        leftItem: (
          <HeaderCloseModalButton testID="CacheClearedScreen.header.close" />
        ),
        modalHandleVisible: Platform.OS === 'ios',
      }}
      loader={{
        animate: false,
        label: translate(`cacheClearedScreen.label`),
        state: LoaderViewState.Success,
        testID: 'CacheClearedScreen.animation',
      }}
      testID="CacheClearedScreen"
    />
  );
};

export default CacheClearedScreen;
