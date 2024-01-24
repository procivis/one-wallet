import { LoadingResultState } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import PinCodeSet from '../../components/pin-code/pin-code-set';
import { useInitializeONECoreIdentifiers } from '../../hooks/core-init';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

const PinCodeSetScreen: FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const [state, setState] = useState(LoadingResultState.InProgress);
  const initializeONECoreIdentifiers = useInitializeONECoreIdentifiers();

  useEffect(() => {
    initializeONECoreIdentifiers()
      .then(() => setState(LoadingResultState.Success))
      .catch(() => setState(LoadingResultState.Failure));
  }, [initializeONECoreIdentifiers]);

  const onClose = useCallback(() => {
    if (rootNavigation.canGoBack()) {
      rootNavigation.popToTop();
    }
    rootNavigation.replace('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <PinCodeSet
      onClose={onClose}
      state={state}
      subtitle={translate('onboarding.pinCodeSet.description')}
      title={translate('onboarding.pinCodeSet.title')}
    />
  );
};

export default PinCodeSetScreen;
