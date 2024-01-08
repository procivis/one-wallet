import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PinCodeInitializationScreen from '../../screens/onboarding/pin-code-initialization-screen';
import PinCodeSetScreen from '../../screens/onboarding/pin-code-set-screen';
import { OnboardingNavigatorParamList } from './onboarding-routes';

const OnboardingStack =
  createNativeStackNavigator<OnboardingNavigatorParamList>();

const OnboardingNavigator = () => {
  return (
    <OnboardingStack.Navigator
      initialRouteName={'PinCodeInitialization'}
      screenOptions={{ headerShown: false }}
    >
      <OnboardingStack.Screen
        component={PinCodeInitializationScreen}
        name="PinCodeInitialization"
      />
      <OnboardingStack.Screen component={PinCodeSetScreen} name="PinCodeSet" />
    </OnboardingStack.Navigator>
  );
};

export default OnboardingNavigator;
