import {
  PinCodeScreen,
  PinCodeScreenActions,
  PinCodeScreenProps,
  TouchableOpacityRef,
  useAccessibilityAnnouncement,
  useAccessibilityFocus,
} from '@procivis/react-native-components';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

import { translate } from '../../i18n';
import { PIN_CODE_LENGTH, usePinCodeEntry } from './pin-code';

export interface PinCodeScreenContentProps {
  title: string;
  instruction?: string;
  error?: string;
  onPinEntered: (userEntry: string) => void;
  onBack?: () => void;
  biometry?: PinCodeScreenProps['biometry'];
  onBiometricPress?: PinCodeScreenProps['onBiometricPress'];
}

export interface PinCodeActions {
  clearEntry: () => void;
  shakeKeypad: () => Promise<void>;
}

const PinCodeScreenContent = forwardRef<PinCodeActions, PinCodeScreenContentProps>(
  ({ title, instruction, error, onPinEntered, onBack, biometry, onBiometricPress }, ref) => {
    const entry = usePinCodeEntry(onPinEntered);

    const actionsRef = useRef<PinCodeScreenActions>(null);
    useImperativeHandle(
      ref,
      () => ({
        clearEntry: entry.clear,
        shakeKeypad: async () => {
          await actionsRef.current?.shakeKeypad();
        },
      }),
      [entry],
    );

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

    return (
      <PinCodeScreen
        ref={actionsRef}
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
        onBiometricPress={onBiometricPress}
      />
    );
  },
);

PinCodeScreenContent.displayName = 'PinCodeScreenContent';

export default PinCodeScreenContent;
