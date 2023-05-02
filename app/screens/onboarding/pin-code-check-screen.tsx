import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

import { PinCodeMode } from '../../components/pin-code/pin-code-entry';
import PinCodeScreenContent from '../../components/pin-code/pin-code-screen-content';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

const PinCodeCheckScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'PinCodeCheck'>>();

  // disable back-button on android while on PIN screen
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });
    return () => subscription.remove();
  }, []);

  const onFinished = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  return <PinCodeScreenContent mode={PinCodeMode.Check} onFinished={onFinished} />;
};

export default PinCodeCheckScreen;
