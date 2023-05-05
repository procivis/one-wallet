import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';

import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

const PinCodeSetScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();

  const onClose = useCallback(() => {
    rootNavigation.replace('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  useBlockOSBackNavigation();

  return (
    <LoadingResult
      variation={LoadingResultVariation.Neutral}
      title={translate('onboarding.pinCodeSet.title')}
      subtitle={translate('onboarding.pinCodeSet.description')}
      state={LoadingResultState.Success}
      inProgressCloseButtonLabel={translate('common.close')}
      successCloseButtonLabel={translate('common.continue')}
      failureCloseButtonLabel={translate('common.close')}
      onClose={onClose}
    />
  );
};

export default PinCodeSetScreen;
