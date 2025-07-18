import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useEffect, useRef, useState } from 'react';

import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import RSEPinView from './rse-pin-view';

const { addEventListener: addRSEEventListener, PinEventType } = Ubiqu;

export interface PinCodeScreenActions {
  shakeKeypad: (params?: {
    amount?: number;
    duration?: number;
  }) => Promise<{ finished: boolean }>;
}

export const RSESignScreen: FC = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const pinLength = 5;
  const [enteredLength, setEnteredLength] = useState(0);
  const [error, setError] = useState<string>();
  const dismissed = useRef(false);

  const testID = 'RemoteSecureElementSignScreen';

  useEffect(() => {
    return addRSEEventListener((event) => {
      switch (event.type) {
        case PinEventType.HIDE_PIN: {
          if (!dismissed.current) {
            dismissed.current = true;
            rootNavigation.goBack();
          }
          break;
        }
        case PinEventType.DIGITS_ENTERED:
          setEnteredLength(event.digitsEntered);
          if (event.digitsEntered > 0) {
            setError(undefined);
          }
          break;
        case PinEventType.INCORRECT_PIN: {
          setError(
            translate('info.rse.sign.error.wrongPin', {
              attemptsLeft: event.attemptsLeft,
            }),
          );
          break;
        }
      }
    });
  }, [dismissed, rootNavigation]);

  return (
    <RSEPinView
      enteredLength={enteredLength}
      errorMessage={error}
      instruction={translate('info.rse.sign.instruction', { pinLength })}
      isLoading={false}
      testID={testID}
      title={translate('info.rse.sign.title')}
    />
  );
};
