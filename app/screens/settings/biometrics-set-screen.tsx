import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';

import { translate } from '../../i18n';
import {
  SettingsNavigationProp,
  SettingsRouteProp,
} from '../../navigators/settings/settings-routes';

const BiometricsSetScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'BiometricsSet'>>();
  const route = useRoute<SettingsRouteProp<'BiometricsSet'>>();
  const biometricsStateKey = route.params.enabled ? 'enabled' : 'disabled';

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useBlockOSBackNavigation();

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.close')}
      onClose={onClose}
      state={LoadingResultState.Success}
      subtitle={translate(
        `settings.security.biometricsSet.${biometricsStateKey}.description`,
      )}
      successCloseButtonLabel={translate('common.continue')}
      testID="BiometricsSetScreen"
      title={translate(
        `settings.security.biometricsSet.${biometricsStateKey}.title`,
      )}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default BiometricsSetScreen;
