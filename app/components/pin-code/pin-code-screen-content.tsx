import {
  Biometry,
  PinCodeScreen,
  TouchableOpacityRef,
  useAccessibilityAnnouncement,
  useAccessibilityFocus,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { AppState } from 'react-native';

import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportTraceInfo } from '../../utils/reporting';
import { biometricAuthenticate } from './biometric';
import { PIN_CODE_LENGTH, usePinCodeEntry } from './pin-code';

export type PinCodeScreenContentProps = {
  title: string;
  instruction?: string;
  error?: string;
  onPinEntered: (userEntry: string) => void;
  onBack?: () => void;
} & (
  | {
      biometry: Biometry;
      onBiometryPassed: () => void;
    }
  | {
      biometry?: undefined;
      onBiometryPassed?: undefined;
    }
);

export interface PinCodeScreenActions {
  clearEntry: () => void;
}

const PinCodeScreenContent = forwardRef<PinCodeScreenActions, PinCodeScreenContentProps>(
  ({ title, instruction, error, onPinEntered, onBack, biometry, onBiometryPassed }, ref) => {
    const navigation = useNavigation<RootNavigationProp>();

    const entry = usePinCodeEntry(onPinEntered);

    useImperativeHandle(ref, () => ({ clearEntry: entry.clear }), [entry]);

    const [accessibilityAnnounced, setAccessibilityAnnounced] = useState(false);
    const accessibilityFocus = useAccessibilityFocus<TouchableOpacityRef>(accessibilityAnnounced);

    const [progressAnnouncement, setProgressAnnouncement] = useState<string>();
    useAccessibilityAnnouncement(progressAnnouncement);
    const onPressDigit = useCallback(
      (digit: number) => {
        entry.onPressDigit?.(digit);
        if (entry.enteredLength < PIN_CODE_LENGTH - 1) {
          setProgressAnnouncement(
            translate('onboarding.pinCodeScreen.entry.digit', {
              digit,
              left: PIN_CODE_LENGTH - entry.enteredLength - 1,
            }),
          );
        }
      },
      [entry],
    );

    const onPressDelete = useCallback(() => {
      entry.onPressDelete?.();
      if (entry.enteredLength) {
        setProgressAnnouncement(
          translate('onboarding.pinCodeScreen.entry.delete', {
            left: PIN_CODE_LENGTH - entry.enteredLength + 1,
          }),
        );
      }
    }, [entry]);

    const onPressDeleteAll = useCallback(() => {
      entry.onPressDeleteAll?.();
      if (entry.enteredLength) {
        setProgressAnnouncement(
          translate('onboarding.pinCodeScreen.entry.delete', {
            left: PIN_CODE_LENGTH,
          }),
        );
      }
    }, [entry]);

    const instructionProps = instruction
      ? {
          instruction,
          onAccessibilityAnnounced: setAccessibilityAnnounced,
        }
      : {};

    const runBiometricCheck = useCallback(() => {
      if (!biometry || !onBiometryPassed) {
        return;
      }

      biometricAuthenticate({
        cancelLabel: translate('onboarding.pinCodeScreen.biometric.cancel'),
        promptMessage: translate('onboarding.pinCodeScreen.biometric.prompt'),
      })
        .then(() => onBiometryPassed())
        .catch((e) => {
          reportTraceInfo('Wallet', 'Biometric login failed', e);
        });
    }, [biometry, onBiometryPassed]);

    useEffect(() => {
      if (biometry) {
        return navigation.addListener('transitionEnd', () => {
          if (AppState.currentState === 'active') {
            runBiometricCheck();
          }
        });
      }
      return undefined;
    }, [biometry, navigation, runBiometricCheck]);

    return (
      <PinCodeScreen
        length={PIN_CODE_LENGTH}
        title={title}
        {...instructionProps}
        onBack={onBack}
        keypadRef={accessibilityFocus}
        enteredLength={entry.enteredLength}
        error={entry.enteredLength ? undefined : error}
        onPressDigit={onPressDigit}
        onPressDelete={onPressDelete}
        onDeleteAll={onPressDeleteAll}
        biometry={biometry}
        onBiometricPress={runBiometricCheck}
      />
    );
  },
);

PinCodeScreenContent.displayName = 'PinCodeScreenContent';

export default PinCodeScreenContent;
