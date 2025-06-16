import { LoaderViewState } from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
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

  return (
    <ProcessingView
      loaderLabel={translate(
        rse
          ? 'settings.security.rse.pinCodeSet.title'
          : 'settings.security.pinCodeSet.title',
      )}
      onClose={closeButtonHandler}
      state={LoaderViewState.Success}
      testID="PinCodeSetScreen"
    />
  );
};

export default PinCodeSetScreen;
