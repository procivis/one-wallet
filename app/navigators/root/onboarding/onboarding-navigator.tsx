import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PinCodeInitializationScreen from '../../../screens/onboarding/pin-code-initialization-screen';
import { OnboardingNavigatorParamList } from './onboarding-routes';

const OnboardingStack = createNativeStackNavigator<OnboardingNavigatorParamList>();

const OnboardingNavigator = () => {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'PinCodeInitialization'}>
      <OnboardingStack.Screen name="PinCodeInitialization" component={PinCodeInitializationScreen} />
    </OnboardingStack.Navigator>
  );
};

export default OnboardingNavigator;
