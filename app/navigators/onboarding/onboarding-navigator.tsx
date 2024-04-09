import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PinCodeInitializationScreen from '../../screens/onboarding/pin-code-initialization-screen';
import { SecurityScreen } from '../../screens/onboarding/security-screen';
import { SetupScreen } from '../../screens/onboarding/setup-screen';
import { UserAgreementScreen } from '../../screens/onboarding/user-agreement-screen';
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
        component={UserAgreementScreen}
        name="UserAgreement"
      />
      <OnboardingStack.Screen component={SecurityScreen} name="Security" />
      <OnboardingStack.Screen
        component={PinCodeInitializationScreen}
        name="PinCodeInitialization"
      />
    </OnboardingStack.Navigator>
  );
};

export default OnboardingNavigator;
