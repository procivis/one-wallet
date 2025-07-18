import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useEffect, useRef, useState } from 'react';

import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import RSEPinView from './rse-pin-view';

const {
  addEventListener: addRSEEventListener,
  changePin: changeRSEPin,
  PinEventType,
  PinFlowStage,
} = Ubiqu;

export interface PinCodeScreenActions {
  shakeKeypad: (params?: {
    amount?: number;
    duration?: number;
  }) => Promise<{ finished: boolean }>;
}

type Step = 'checkCurrentPin' | 'setPin' | 'confirmPin';
const pinFlowStageMap: Record<keyof typeof PinFlowStage, Step> = {
  [PinFlowStage.CHECK_CURRENT_PIN]: 'checkCurrentPin',
  [PinFlowStage.NEW_FIRST_PIN]: 'setPin',
  [PinFlowStage.NEW_SECOND_PIN]: 'confirmPin',
};

export const RSEChangePinScreen: FC = () => {
  const navigation =
    useNavigation<SettingsNavigationProp<'RSEPinCodeChange'>>();
  const pinLength = 5;
  const [enteredLength, setEnteredLength] = useState(0);
  const [step, setStep] = useState<'checkCurrentPin' | 'setPin' | 'confirmPin'>(
    'checkCurrentPin',
  );
  const [error, setError] = useState<string>();
  const incorrectPin = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const testID = 'RemoteSecureElementChangePinScreen';

  useEffect(() => {
    changeRSEPin().catch(() => {});
  }, []);

  useEffect(() => {
    return addRSEEventListener((event) => {
      switch (event.type) {
        case PinEventType.SHOW_PIN:
          setIsLoading(false);
          break;
        case PinEventType.HIDE_PIN:
          if (incorrectPin.current) {
            incorrectPin.current = false;
            setIsLoading(true);
            changeRSEPin().catch(() => {});
          } else {
            navigation.replace('PinCodeSet', { rse: true });
          }
          break;
        case PinEventType.DIGITS_ENTERED:
          if (event.digitsEntered > 0) {
            setError(undefined);
          }
          setEnteredLength(event.digitsEntered);
          break;
        case PinEventType.PIN_STAGE: {
          const newStep = pinFlowStageMap[event.stage];
          setStep(newStep);
          if (newStep === 'setPin' && step === 'confirmPin' && !error) {
            setError(translate('info.rse.changePin.confirmPin.error'));
          }
          break;
        }
        case PinEventType.INCORRECT_PIN:
          if (event.attemptsLeft > 0) {
            incorrectPin.current = true;
          }
          setError(
            translate('info.rse.changePin.checkCurrentPin.error', {
              attemptsLeft: event.attemptsLeft,
            }),
          );
          break;
      }
    });
  }, [navigation, step, error]);

  return (
    <RSEPinView
      enteredLength={enteredLength}
      errorMessage={error}
      instruction={translate(`rseChangePin.${step}.instruction`, {
        pinLength,
      })}
      isLoading={isLoading}
      testID={testID}
      title={translate(`rseChangePin.${step}.title`)}
    />
  );
};
