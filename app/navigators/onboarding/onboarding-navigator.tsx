import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PinCodeInitializationScreen from '../../screens/onboarding/pin-code-initialization-screen';
import PinCodeSetScreen from '../../screens/onboarding/pin-code-set-screen';
import { SetupScreen } from '../../screens/onboarding/setup-screen';
import { OnboardingNavigatorParamList } from './onboarding-routes';

const OnboardingStack =
  createNativeStackNavigator<OnboardingNavigatorParamList>();

const OnboardingNavigator = () => {
  return (
    <OnboardingStack.Navigator
      initialRouteName={'Setup'}
      screenOptions={{ headerShown: false }}
    >
      <OnboardingStack.Screen component={SetupScreen} name="Setup" />
      <OnboardingStack.Screen
        component={PinCodeInitializationScreen}
        name="PinCodeInitialization"
      />
      <OnboardingStack.Screen component={PinCodeSetScreen} name="PinCodeSet" />
    </OnboardingStack.Navigator>
  );
};

export default OnboardingNavigator;
