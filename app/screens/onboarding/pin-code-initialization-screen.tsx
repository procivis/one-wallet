import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { FunctionComponent, useCallback } from 'react';

import { PinCodeMode } from '../../components/pin-code/pin-code-entry';
import PinCodeScreenContent from '../../components/pin-code/pin-code-screen-content';
import { OnboardingNavigatorParamList } from '../../navigators/root/onboarding/onboarding-routes';

type PinCodeRouteProp = RouteProp<OnboardingNavigatorParamList, 'PinCodeInitialization'>;

const PinCodeInitializationScreen: FunctionComponent = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingNavigatorParamList, 'PinCodeInitialization'>>();
  const route = useRoute<PinCodeRouteProp>();

  const onFinished = useCallback(() => {
    navigation.replace(route.params.nextScreen);
  }, [navigation, route]);

  return <PinCodeScreenContent mode={PinCodeMode.Initialization} onFinished={onFinished} />;
};

export default PinCodeInitializationScreen;
