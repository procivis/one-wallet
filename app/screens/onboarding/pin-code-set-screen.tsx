import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { useInitializeONECoreIdentifiers } from '../../hooks/core/core-init';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const PinCodeSetScreen: FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const [state, setState] = useState(LoadingResultState.InProgress);
  const initializeONECoreIdentifiers = useInitializeONECoreIdentifiers();

  const onClose = useCallback(() => {
    if (rootNavigation.canGoBack()) {
      rootNavigation.popToTop();
    }
    rootNavigation.replace('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  useEffect(() => {
    initializeONECoreIdentifiers()
      .then(() => setState(LoadingResultState.Success))
      .catch(() => setState(LoadingResultState.Failure));
  }, [initializeONECoreIdentifiers]);

  useBlockOSBackNavigation();

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.close')}
      onClose={onClose}
      state={state}
      subtitle={translate('onboarding.pinCodeSet.description')}
      successCloseButtonLabel={translate('common.continue')}
      testID="PinCodeSetScreen"
      title={translate('onboarding.pinCodeSet.title')}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default PinCodeSetScreen;
