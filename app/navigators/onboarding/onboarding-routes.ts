import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type OnboardingNavigatorParamList = {
  PinCodeInitialization: undefined;
  PinCodeSet: undefined;
  Setup: undefined;
};

export type OnboardingRouteProp<
  RouteName extends keyof OnboardingNavigatorParamList,
> = RouteProp<OnboardingNavigatorParamList, RouteName>;
export type OnboardingNavigationProp<
  RouteName extends keyof OnboardingNavigatorParamList,
> = NativeStackNavigationProp<OnboardingNavigatorParamList, RouteName>;
