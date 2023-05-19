import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';

import { storePin } from '../../components/pin-code/pin-code';
import PinCodeScreenContent, { PinCodeActions } from '../../components/pin-code/pin-code-screen-content';
import { translate } from '../../i18n';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';

const PinCodeInitializationScreen: FunctionComponent = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'PinCodeInitialization'>>();
  const screen = useRef<PinCodeActions>(null);

  const [pin, setPin] = useState<string>();
  const [error, setError] = useState<string>();

  const onPinEntered = useCallback(
    (userEntry: string) => {
      if (pin) {
        if (pin === userEntry) {
          storePin(pin);
          navigation.replace('PinCodeSet');
        } else {
          screen.current?.clearEntry();
          setError(translate('onboarding.pinCodeScreen.confirm.error'));
        }
      } else {
        screen.current?.clearEntry();
        setPin(userEntry);
      }
    },
    [navigation, pin],
  );

  const stage = pin ? 'confirm' : 'initial';
  return (
    <PinCodeScreenContent
      testID="PinCodeInitializationScreen"
      ref={screen}
      onPinEntered={onPinEntered}
      title={translate(`onboarding.pinCodeScreen.${stage}.title`)}
      instruction={translate(`onboarding.pinCodeScreen.${stage}.subtitle`)}
      error={error}
    />
  );
};

export default PinCodeInitializationScreen;
