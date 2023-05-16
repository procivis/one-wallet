import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';

import { storePin, usePinCodeValidation } from '../../components/pin-code/pin-code';
import PinCodeScreenContent, { PinCodeScreenActions } from '../../components/pin-code/pin-code-screen-content';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

enum Stage {
  Check = 'check',
  Set = 'initial',
  Confirm = 'confirm',
}

const PinCodeChangeScreen: FunctionComponent = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeChange'>>();
  const screen = useRef<PinCodeScreenActions>(null);

  const validatePin = usePinCodeValidation();

  const [validated, setValidated] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>();
  const [error, setError] = useState<string>();

  const stage = useMemo(() => {
    if (!validated) {
      return Stage.Check;
    }
    return newPin ? Stage.Confirm : Stage.Set;
  }, [newPin, validated]);

  const onPinEntered = useCallback(
    (userEntry: string) => {
      switch (stage) {
        case Stage.Check:
          screen.current?.clearEntry();
          if (validatePin(userEntry)) {
            setError(undefined);
            setValidated(true);
          } else {
            setError(translate('onboarding.pinCodeScreen.check.error'));
          }
          break;
        case Stage.Set:
          screen.current?.clearEntry();
          setNewPin(userEntry);
          break;
        case Stage.Confirm:
          if (newPin === userEntry) {
            storePin(newPin);
            navigation.goBack();
          } else {
            screen.current?.clearEntry();
            setError(translate('onboarding.pinCodeScreen.confirm.error'));
          }
          break;
      }
    },
    [navigation, newPin, stage, validatePin],
  );

  return (
    <PinCodeScreenContent
      ref={screen}
      onBack={navigation.goBack}
      onPinEntered={onPinEntered}
      title={translate(`onboarding.pinCodeScreen.change.${stage}.title`)}
      instruction={translate(`onboarding.pinCodeScreen.${stage}.subtitle`)}
      error={error}
    />
  );
};

export default PinCodeChangeScreen;
