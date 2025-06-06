import {
  concatTestID,
  ContrastingStatusBar,
  HeaderCloseButton,
  LoaderView,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { Pins } from '@procivis/one-react-native-components/src/ui-components/pin/pins';
import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const {
  addEventListener: addRSEEventListener,
  changePin: changeRSEPin,
  PinEventType,
  PinFlowStage,
  PinPad: RSEPinPad,
  resetPinFlow: resetRSEPinFlow,
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
  const colorScheme = useAppColorScheme();
  const [shakePosition] = useState(() => new Animated.Value(0));
  const [enteredLength, setEnteredLenght] = useState(0);
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
            navigation.goBack();
          }
          break;
        case PinEventType.DIGITS_ENTERED:
          if (event.digitsEntered > 0) {
            setError(undefined);
          }
          setEnteredLenght(event.digitsEntered);
          break;
        case PinEventType.PIN_STAGE: {
          const newStep = pinFlowStageMap[event.stage];
          setStep(newStep);
          if (newStep === 'setPin' && step === 'confirmPin' && !error) {
            setError(translate('rse.changePin.confirmPin.error'));
          }
          break;
        }
        case PinEventType.INCORRECT_PIN:
          if (event.attemptsLeft > 0) {
            incorrectPin.current = true;
          }
          setError(
            translate('rse.changePin.checkCurrentPin.error', {
              attemptsLeft: event.attemptsLeft,
            }),
          );
          break;
      }
    });
  }, [navigation, step, error]);

  const handleClose = useCallback(() => {
    resetRSEPinFlow();
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colorScheme.white }]}
      testID={testID}
    >
      <ContrastingStatusBar backgroundColor={colorScheme.white} />
      <View style={styles.backButton}>
        <HeaderCloseButton
          onPress={handleClose}
          testID={concatTestID(testID, 'header.back')}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.upperContent}>
          <Typography
            accessible={false}
            align="center"
            color={colorScheme.text}
            preset="l"
            style={styles.title}
            testID={concatTestID(testID, 'title')}
          >
            {translate(`rse.changePin.${step}.title`)}
          </Typography>
          <Pins
            enteredLength={enteredLength}
            maxLength={5}
            style={styles.pins}
          />
          <Typography
            align="center"
            announcementActive={true}
            color={colorScheme.text}
            style={styles.instruction}
            testID={concatTestID(testID, 'instruction')}
          >
            {translate(`rse.changePin.${step}.instruction`, {
              pinLength,
            })}
          </Typography>
          <Typography
            accessible={Boolean(error)}
            announcementActive={true}
            color={colorScheme.error}
            testID={concatTestID(testID, 'error')}
          >
            {error ?? '' /* always displayed to keep the same layout */}
          </Typography>
        </View>
        <Animated.View
          style={[
            styles.keyboard,
            {
              transform: [{ translateX: shakePosition }],
            },
          ]}
        >
          {isLoading ? (
            <LoaderView animate={true} />
          ) : (
            <RSEPinPad style={styles.pinPad} />
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    minHeight: 24,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    paddingTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  instruction: {
    marginVertical: 24,
    opacity: 0.7,
  },
  keyboard: {
    alignItems: 'center',
    flex: 5,
    justifyContent: 'center',
    marginVertical: 24,
  },
  pinPad: {
    aspectRatio: 3 / 4,
    width: '80%',
  },
  pins: {
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 24,
  },
  upperContent: {
    alignItems: 'center',
    flex: 3,
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
