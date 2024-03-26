import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';

import PinCodeScreenContent, {
  PinCodeActions,
} from '../../components/pin-code/pin-code-screen-content';
import { storePin } from '../../hooks/pin-code/pin-code';
import { translate } from '../../i18n';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';

const PinCodeInitializationScreen: FunctionComponent = () => {
  const navigation =
    useNavigation<OnboardingNavigationProp<'PinCodeInitialization'>>();
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

  useBlockOSBackNavigation();

  const stage = pin ? 'confirm' : 'initial';
  return (
    <PinCodeScreenContent
      error={error}
      instruction={translate(`onboarding.pinCodeScreen.${stage}.subtitle`)}
      onPinEntered={onPinEntered}
      ref={screen}
      testID="PinCodeInitializationScreen"
      title={translate(`onboarding.pinCodeScreen.${stage}.title`)}
    />
  );
};

export default PinCodeInitializationScreen;
