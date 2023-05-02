export type OnboardingNavigatorParamList = {
  Welcome: undefined;
  PinCodeInitialization: {
    nextScreen: keyof OnboardingNavigatorParamList;
  };
};
