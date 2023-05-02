import {
  Keypad,
  P,
  Pins,
  theme,
  Title,
  TouchableOpacityRef,
  useAccessibilityAnnouncement,
  useAccessibilityFocus,
  useAppColorScheme,
} from '@procivis/react-native-components';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Insets, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { reportTraceInfo } from '../../utils/reporting';
import BackButton from '../button/back-button';
import { biometricAuthenticate, useBiometricType } from './biometric';
import { PIN_CODE_LENGTH, PinCodeMode, usePinCodeEntry } from './pin-code-entry';

const backButtonHitSlop: Insets = { top: 12, left: theme.padding, bottom: 12, right: theme.padding };

interface PinCodeScreenContentProps {
  mode: PinCodeMode;
  onFinished: () => void;
  onGoBack?: () => void;
}
const PinCodeScreenContent: FunctionComponent<PinCodeScreenContentProps> = ({ mode, onFinished, onGoBack }) => {
  const colorScheme = useAppColorScheme();
  const status = usePinCodeEntry(mode);
  useEffect(() => {
    if (status.finished) {
      onFinished();
    }
  }, [onFinished, status.finished]);

  const biometry = useBiometricType();
  const { userSettings } = useStores();

  const onBiometricPress = useCallback(() => {
    biometricAuthenticate({
      cancelLabel: translate('onboarding.pinCodeScreen.biometric.cancel'),
      promptMessage: translate('onboarding.pinCodeScreen.biometric.prompt'),
    })
      .then(() => onFinished())
      .catch((e) => {
        reportTraceInfo('Wallet', 'Biometric login failed', e);
      });
  }, [onFinished]);

  const titleMode = mode === PinCodeMode.Change ? 'change.' : '';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.white }]}>
      {onGoBack && (
        <View style={styles.backButton}>
          <BackButton onPress={onGoBack} hitSlop={backButtonHitSlop} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.upperContent}>
          <Title accessible={false} bold={true} color={colorScheme.text} align="center" size="big">
            {translate(`onboarding.pinCodeScreen.${titleMode}${status.stage}.title`)}
          </Title>
          <P
            announcementActive={true}
            onAnnouncementFinished={setAccessibilityAnnounced}
            color={colorScheme.text}
            style={styles.description}>
            {translate(`onboarding.pinCodeScreen.${status.stage}.subtitle`)}
          </P>
          <Pins style={styles.pins} enteredLength={status.enteredLength} maxLength={PIN_CODE_LENGTH} />
          <P
            announcementActive={true}
            accessible={Boolean(status.error)}
            color={colorScheme.alertText}
            style={styles.error}>
            {status.error ?? '' /* always displayed to keep the same layout */}
          </P>
        </View>
        <Keypad
          ref={accessibilityFocus}
          style={styles.keyboard}
          onPressDigit={status.onPressDigit && onPressDigit}
          onPressDelete={status.onPressDelete && onPressDelete}
          biometry={mode !== PinCodeMode.Check || !userSettings.biometricLogin ? null : biometry}
          onBiometricPress={onBiometricPress}
          accessibilityLabelDelete={translate('onboarding.pinCodeScreen.key.delete')}
          accessibilityLabelFaceID={translate('onboarding.pinCodeScreen.key.faceID')}
          accessibilityLabelFingerprint={translate('onboarding.pinCodeScreen.key.fingerprint')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: theme.padding,
  },
  container: {
    flex: 1,
    paddingTop: theme.paddingM,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.padding,
  },
  description: {
    marginTop: theme.grid,
    paddingHorizontal: 2 * theme.padding,
    textAlign: 'center',
  },
  error: {
    marginTop: theme.grid,
  },
  keyboard: {
    flex: 1,
    marginVertical: 2 * theme.padding,
  },
  pins: {
    marginTop: 2 * theme.padding,
    paddingHorizontal: 2 * theme.padding,
  },
  upperContent: {
    alignItems: 'center',
    flex: 1,
    marginTop: theme.padding,
  },
});

export default PinCodeScreenContent;
