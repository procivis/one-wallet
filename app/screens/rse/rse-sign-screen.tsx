import {
  concatTestID,
  ContrastingStatusBar,
  HeaderBackButton,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { Pins } from '@procivis/one-react-native-components/src/ui-components/pin/pins';
import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const {
  addEventListener: addRSEEventListener,
  PinEventType,
  PinPad: RSEPinPad,
} = Ubiqu;

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
  const colorScheme = useAppColorScheme();
  const [shakePosition] = useState(() => new Animated.Value(0));
  const [enteredLength, setEnteredLenght] = useState(0);
  const [error, setError] = useState<string>();

  const testID = 'RemoteSecureElementSignScreen';

  useEffect(() => {
    return addRSEEventListener((event) => {
      switch (event.type) {
        case PinEventType.HIDE_PIN:
          rootNavigation.goBack();
          break;
        case PinEventType.DIGITS_ENTERED:
          setEnteredLenght(event.digitsEntered);
          break;
        case PinEventType.INCORRECT_PIN: {
          setError(translate('rse.sign.error.wrongPin'));
          break;
        }
      }
    });
  }, [rootNavigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colorScheme.white }]}
      testID={testID}
    >
      <ContrastingStatusBar backgroundColor={colorScheme.white} />
      <View style={styles.backButton}>
        <HeaderBackButton testID={concatTestID(testID, 'header.back')} />
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
            {translate('rse.sign.title')}
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
            {translate('rse.sign.instruction', { pinLength })}
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
          <RSEPinPad style={styles.pinPad} />
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
