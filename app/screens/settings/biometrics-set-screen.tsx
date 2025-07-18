import { LoaderViewState } from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
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

  return (
    <ProcessingView
      loaderLabel={translate(
        `securityBiometricsSetTitle.${biometricsStateKey}`,
      )}
      onClose={closeButtonHandler}
      state={LoaderViewState.Success}
      testID="BiometricsSetScreen"
    />
  );
};

export default BiometricsSetScreen;
