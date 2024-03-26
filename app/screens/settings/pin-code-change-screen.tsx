import { useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import PinCodeScreenContent, {
  PinCodeActions,
} from '../../components/pin-code/pin-code-screen-content';
import { storePin, usePinCodeValidation } from '../../hooks/pin-code/pin-code';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

enum Stage {
  Check = 'check',
  Confirm = 'confirm',
  Set = 'initial',
}

const PinCodeChangeScreen: FunctionComponent = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeChange'>>();
  const screen = useRef<PinCodeActions>(null);

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
            navigation.replace('PinCodeSet');
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
      error={error}
      instruction={translate(`onboarding.pinCodeScreen.${stage}.subtitle`)}
      onBack={navigation.goBack}
      onPinEntered={onPinEntered}
      ref={screen}
      title={translate(`onboarding.pinCodeScreen.change.${stage}.title`)}
    />
  );
};

export default PinCodeChangeScreen;
