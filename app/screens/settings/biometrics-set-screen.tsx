import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCloseButtonTimeout } from '../../hooks/navigation/close-button-timeout';
import { translate } from '../../i18n';
import {
  SettingsNavigationProp,
  SettingsRouteProp,
} from '../../navigators/settings/settings-routes';

const BiometricsSetScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'BiometricsSet'>>();
  const route = useRoute<SettingsRouteProp<'BiometricsSet'>>();
  const biometricsStateKey = route.params.enabled ? 'enabled' : 'disabled';

  const closeButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const { closeTimeout } = useCloseButtonTimeout(true, closeButtonHandler);

  return (
    <LoadingResultScreen
      button={{
        onPress: closeButtonHandler,
        testID: 'BiometricsSetScreen.close',
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
        label: translate(
          `settings.security.biometricsSet.${biometricsStateKey}.title`,
        ),
        state: LoaderViewState.Success,
        testID: 'BiometricsSetScreen.animation',
      }}
      testID="BiometricsSetScreen"
    />
  );
};

export default BiometricsSetScreen;
