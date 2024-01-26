import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';

import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const PinCodeSetScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeChange'>>();

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
      subtitle={translate('wallet.settings.security.pinCodeSet.description')}
      successCloseButtonLabel={translate('common.continue')}
      testID="PinCodeSetScreen"
      title={translate('wallet.settings.security.pinCodeSet.title')}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default PinCodeSetScreen;
