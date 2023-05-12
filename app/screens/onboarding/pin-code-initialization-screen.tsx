import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';

import { PinCodeMode } from '../../components/pin-code/pin-code-entry';
import PinCodeScreenContent from '../../components/pin-code/pin-code-screen-content';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';

const PinCodeInitializationScreen: FunctionComponent = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'PinCodeInitialization'>>();

  const onFinished = useCallback(() => {
    navigation.replace('PinCodeSet');
  }, [navigation]);

  return <PinCodeScreenContent mode={PinCodeMode.Initialization} onFinished={onFinished} />;
};

export default PinCodeInitializationScreen;
