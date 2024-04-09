import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';

import PinCodeScreenContent, {
  PinCodeActions,
} from '../../components/pin-code/pin-code-screen-content';
import { useInitializeONECoreIdentifiers } from '../../hooks/core/core-init';
import { storePin } from '../../hooks/pin-code/pin-code';
import { translate } from '../../i18n';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const PinCodeInitializationScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const navigation =
    useNavigation<OnboardingNavigationProp<'PinCodeInitialization'>>();

  const initializeONECoreIdentifiers = useInitializeONECoreIdentifiers();
  const finishSetup = useCallback(() => {
    initializeONECoreIdentifiers();
    rootNavigation.popToTop();
    rootNavigation.replace('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation, initializeONECoreIdentifiers]);

  const screen = useRef<PinCodeActions>(null);
  const [pin, setPin] = useState<string>();
  const [error, setError] = useState<string>();

  const onPinEntered = useCallback(
    (userEntry: string) => {
      if (pin) {
        if (pin === userEntry) {
          storePin(pin);
          finishSetup();
        } else {
          screen.current?.clearEntry();
          screen.current?.shakeKeypad();
          setError(translate('onboarding.pinCodeScreen.confirm.error'));
        }
      } else {
        screen.current?.clearEntry();
        setPin(userEntry);
      }
    },
    [finishSetup, pin],
  );

  const stage = pin ? 'confirm' : 'initial';
  return (
    <PinCodeScreenContent
      error={error}
      instruction={translate(`onboarding.pinCodeScreen.${stage}.subtitle`)}
      onBack={navigation.goBack}
      onPinEntered={onPinEntered}
      ref={screen}
      testID="PinCodeInitializationScreen"
      title={translate(`onboarding.pinCodeScreen.${stage}.title`)}
    />
  );
};

export default PinCodeInitializationScreen;
