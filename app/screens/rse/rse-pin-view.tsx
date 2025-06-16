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
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { PinPad: RSEPinPad, resetPinFlow: resetRSEPinFlow } = Ubiqu;

type RSEPinViewProps = {
  enteredLength: number;
  errorMessage?: string;
  instruction: string;
  isLoading: boolean;
  testID: string;
  title: string;
};

const RSEPinView: FC<RSEPinViewProps> = ({
  enteredLength,
  errorMessage,
  instruction,
  isLoading,
  testID,
  title,
}) => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation();
  const [shakePosition] = useState(() => new Animated.Value(0));

  const shakeKeypad = useCallback(() => {
    const amount = 10;
    const duration = 300;
    const iterations = 4;
    const animationConfig = {
      easing: Easing.linear,
      useNativeDriver: true,
    };
    const partialDuration = duration / iterations / 4;
    return new Promise((resolve) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakePosition, {
            ...animationConfig,
            duration: partialDuration,
            toValue: -amount,
          }),
          Animated.timing(shakePosition, {
            ...animationConfig,
            duration: 2 * partialDuration,
            toValue: amount,
          }),
          Animated.timing(shakePosition, {
            ...animationConfig,
            duration: partialDuration,
            toValue: 0,
          }),
        ]),
        { iterations },
      ).start(resolve),
    );
  }, [shakePosition]);

  useEffect(() => {
    if (errorMessage) {
      shakeKeypad();
    }
  }, [errorMessage, shakeKeypad]);

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
            {title}
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
            {instruction}
          </Typography>
          <Typography
            accessible={Boolean(errorMessage)}
            announcementActive={true}
            color={colorScheme.error}
            testID={concatTestID(testID, 'error')}
          >
            {errorMessage ?? '' /* always displayed to keep the same layout */}
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

export default RSEPinView;
