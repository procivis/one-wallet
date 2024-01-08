import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useInitializeONECoreIdentifiers } from '../../hooks/core-init';
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

  const [status, setStatus] = useState(LoadingResultState.InProgress);
  const initializeONECoreIdentifiers = useInitializeONECoreIdentifiers();
  useEffect(() => {
    initializeONECoreIdentifiers()
      .then(() => setStatus(LoadingResultState.Success))
      .catch(() => setStatus(LoadingResultState.Failure));
  }, [initializeONECoreIdentifiers]);

  useBlockOSBackNavigation();

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.close')}
      onClose={onClose}
      state={status}
      subtitle={translate('onboarding.pinCodeSet.description')}
      successCloseButtonLabel={translate('common.continue')}
      testID="PinCodeSetScreen"
      title={translate('onboarding.pinCodeSet.title')}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default PinCodeSetScreen;
