import {
  PinCodeScreen,
  TouchableOpacityRef,
  useAccessibilityAnnouncement,
  useAccessibilityFocus,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportTraceInfo } from '../../utils/reporting';
import { biometricAuthenticate, useBiometricType } from './biometric';
import { PIN_CODE_LENGTH, PinCodeMode, usePinCodeEntry } from './pin-code-entry';

interface PinCodeScreenContentProps {
  mode: PinCodeMode;
  disableBiometry?: boolean;
  onFinished: () => void;
  onGoBack?: () => void;
}
const PinCodeScreenContent: FunctionComponent<PinCodeScreenContentProps> = ({
  mode,
  onFinished,
  onGoBack,
  disableBiometry,
}) => {
  const navigation = useNavigation<RootNavigationProp>();

  const status = usePinCodeEntry(mode);
  useEffect(() => {
    if (status.finished) {
      onFinished();
    }
  }, [onFinished, status.finished]);

  const biometry = useBiometricType();
  const { userSettings } = useStores();

  const runBiometricCheck = useCallback(() => {
    biometricAuthenticate({
      cancelLabel: translate('onboarding.pinCodeScreen.biometric.cancel'),
      promptMessage: translate('onboarding.pinCodeScreen.biometric.prompt'),
    })
      .then(() => onFinished())
      .catch((e) => {
        reportTraceInfo('Wallet', 'Biometric login failed', e);
      });
  }, [onFinished]);

  const biometricCheckAvailable = mode === PinCodeMode.Check && userSettings.biometricLogin && !disableBiometry;

  useEffect(() => {
    if (biometricCheckAvailable) {
      return navigation.addListener('transitionEnd', () => {
        if (AppState.currentState === 'active') {
          runBiometricCheck();
        }
      });
    }
    return undefined;
  }, [biometricCheckAvailable, navigation, runBiometricCheck]);

  const [accessibilityAnnounced, setAccessibilityAnnounced] = useState(false);
  const accessibilityFocus = useAccessibilityFocus<TouchableOpacityRef>(accessibilityAnnounced);

  const [progressAnnouncement, setProgressAnnouncement] = useState<string>();
  useAccessibilityAnnouncement(progressAnnouncement);
  const onPressDigit = useCallback(
    (digit: number) => {
      status.onPressDigit?.(digit);
      if (status.enteredLength < PIN_CODE_LENGTH - 1) {
        setProgressAnnouncement(
          translate('onboarding.pinCodeScreen.entry.digit', {
            digit,
            left: PIN_CODE_LENGTH - status.enteredLength - 1,
          }),
        );
      }
    },
    [status],
  );

  const onPressDelete = useCallback(() => {
    status.onPressDelete?.();
    if (status.enteredLength) {
      setProgressAnnouncement(
        translate('onboarding.pinCodeScreen.entry.delete', {
          left: PIN_CODE_LENGTH - status.enteredLength + 1,
        }),
      );
    }
  }, [status]);

  const onPressDeleteAll = useCallback(() => {
    status.onPressDeleteAll?.();
    if (status.enteredLength) {
      setProgressAnnouncement(
        translate('onboarding.pinCodeScreen.entry.delete', {
          left: PIN_CODE_LENGTH,
        }),
      );
    }
  }, [status]);

  const titleMode = mode === PinCodeMode.Change ? 'change.' : '';
  return (
    <PinCodeScreen
      length={PIN_CODE_LENGTH}
      title={translate(`onboarding.pinCodeScreen.${titleMode}${status.stage}.title`)}
      instruction={translate(`onboarding.pinCodeScreen.${status.stage}.subtitle`)}
      onAccessibilityAnnounced={setAccessibilityAnnounced}
      onBack={onGoBack}
      keypadRef={accessibilityFocus}
      enteredLength={status.enteredLength}
      error={status.error}
      onPressDigit={onPressDigit}
      onPressDelete={onPressDelete}
      onDeleteAll={onPressDeleteAll}
      biometry={biometricCheckAvailable ? biometry : null}
      onBiometricPress={runBiometricCheck}
    />
  );
};

export default PinCodeScreenContent;
