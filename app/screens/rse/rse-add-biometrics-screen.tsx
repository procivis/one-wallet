import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useEffect, useState } from 'react';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import RSEPinView from './rse-pin-view';

const { addEventListener: addRSEEventListener, PinEventType } = Ubiqu;

export interface PinCodeScreenActions {
  shakeKeypad: (params?: {
    amount?: number;
    duration?: number;
  }) => Promise<{ finished: boolean }>;
}

export const RSEAddBiometricsScreen: FC = () => {
  const navigation = useNavigation();
  const { userSettings } = useStores();
  const pinLength = 5;
  const [enteredLength, setEnteredLength] = useState(0);
  const [error, setError] = useState<string>();

  const testID = 'RemoteSecureElementAddBiometricsScreen';

  useEffect(() => {
    return addRSEEventListener((event) => {
      switch (event.type) {
        case PinEventType.HIDE_PIN:
          navigation.goBack();
          break;
        case PinEventType.DIGITS_ENTERED:
          setEnteredLength(event.digitsEntered);
          if (event.digitsEntered > 0) {
            setError(undefined);
          }
          break;
        case PinEventType.INCORRECT_PIN: {
          setError(
            translate('rse.addBiometrics.error.wrongPin', {
              attemptsLeft: event.attemptsLeft,
            }),
          );
          break;
        }
      }
    });
  }, [navigation, userSettings]);

  return (
    <RSEPinView
      enteredLength={enteredLength}
      errorMessage={error}
      instruction={translate('rse.addBiometrics.instruction', { pinLength })}
      isLoading={false}
      testID={testID}
      title={translate('rse.addBiometrics.title')}
    />
  );
};
