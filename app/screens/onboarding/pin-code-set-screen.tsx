import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect } from 'react';

import { useInitializeONECore } from '../../hooks/core-init';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

const PinCodeSetScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();

  const onClose = useCallback(() => {
    if (rootNavigation.canGoBack()) {
      rootNavigation.popToTop();
    }
    rootNavigation.replace('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  const initializeONECore = useInitializeONECore();
  useEffect(() => {
    initializeONECore();
  }, [initializeONECore]);

  useBlockOSBackNavigation();

  return (
    <LoadingResult
      testID="PinCodeSetScreen"
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
