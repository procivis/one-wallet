import {
  PinCodeScreen,
  PinCodeScreenActions,
  PinCodeScreenProps,
  TouchableOpacityRef,
  useAccessibilityAnnouncement,
  useAccessibilityFocus,
} from '@procivis/one-react-native-components';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  PIN_CODE_LENGTH,
  usePinCodeEntry,
} from '../../hooks/pin-code/pin-code';
import { translate } from '../../i18n';

export interface PinCodeScreenContentProps {
  biometry?: PinCodeScreenProps['biometry'];
  error?: string;
  instruction?: string;
  onBack?: () => void;
  onBiometricPress?: PinCodeScreenProps['onBiometricPress'];
  onPinEntered: (userEntry: string) => void;
  testID?: string;
  title: string;
}

export interface PinCodeActions {
  clearEntry: () => void;
  shakeKeypad: () => Promise<void>;
}

const PinCodeScreenContent = forwardRef<
  PinCodeActions,
  PinCodeScreenContentProps
>(
  (
    {
      testID,
      title,
      instruction,
      error,
      onPinEntered,
      onBack,
      biometry,
      onBiometricPress,
    },
    ref,
  ) => {
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
    const accessibilityFocus = useAccessibilityFocus<TouchableOpacityRef>(
      accessibilityAnnounced,
    );

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
        length={PIN_CODE_LENGTH}
        ref={actionsRef}
        testID={testID}
        title={title}
        {...instructionProps}
        biometry={biometry}
        enteredLength={entry.enteredLength}
        error={entry.enteredLength ? undefined : error}
        keypadRef={accessibilityFocus}
        onBack={onBack}
        onBiometricPress={onBiometricPress}
        onDeleteAll={onPressDeleteAll}
        onPressDelete={onPressDelete}
        onPressDigit={onPressDigit}
      />
    );
  },
);

PinCodeScreenContent.displayName = 'PinCodeScreenContent';

export default PinCodeScreenContent;
