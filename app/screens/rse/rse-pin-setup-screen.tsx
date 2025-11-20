import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useEffect, useRef, useState } from 'react';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { IssueCredentialNavigationProp } from '../../navigators/issue-credential/issue-credential-routes';
import RSEPinView from './rse-pin-view';

const {
  addEventListener: addRSEEventListener,
  PinEventType,
  PinFlowStage,
} = Ubiqu;

export interface PinCodeScreenActions {
  shakeKeypad: (params?: {
    amount?: number;
    duration?: number;
  }) => Promise<{ finished: boolean }>;
}

type Step = 'setPin' | 'confirmPin';
const pinFlowStageMap: Partial<Record<keyof typeof PinFlowStage, Step>> = {
  [PinFlowStage.NEW_FIRST_PIN]: 'setPin',
  [PinFlowStage.NEW_SECOND_PIN]: 'confirmPin',
};

export const RSEPinSetupScreen: FC = () => {
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'RSEPinSetup'>>();
  const pinLength = 5;
  const [enteredLength, setEnteredLength] = useState(0);
  const [step, setStep] = useState<'setPin' | 'confirmPin'>('setPin');
  const [error, setError] = useState<string>();
  const manualDismiss = useRef(false);
  const { walletStore } = useStores();

  const testID = 'RemoteSecureElementPinSetupScreen';

  useEffect(() => {
    return addRSEEventListener((event) => {
      switch (event.type) {
        case PinEventType.HIDE_PIN:
          if (!manualDismiss.current) {
            if (!walletStore.isRSESetup) {
              walletStore.rseSetupCompleted();
            }
            navigation.goBack();
          }
          break;
        case PinEventType.DIGITS_ENTERED:
          setEnteredLength(event.digitsEntered);
          if (event.digitsEntered > 0) {
            setError(undefined);
          }
          break;
        case PinEventType.PIN_STAGE: {
          const newStep = pinFlowStageMap[event.stage];
          if (!newStep) {
            break;
          }
          setStep(newStep);
          if (newStep === 'setPin') {
            setError(translate('info.rse.pinSetup.confirmPin.error'));
          }
          break;
        }
      }
    });
  }, [navigation, walletStore]);

  return (
    <RSEPinView
      enteredLength={enteredLength}
      errorMessage={error}
      instruction={translate(`rsePinSetup.${step}.instruction`, {
        pinLength,
      })}
      isLoading={false}
      manualDismiss={manualDismiss}
      testID={testID}
      title={translate(`rsePinSetup.${step}.title`)}
    />
  );
};
