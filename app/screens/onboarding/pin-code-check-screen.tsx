import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';
import { Platform } from 'react-native';

import { PinCodeMode } from '../../components/pin-code/pin-code-entry';
import PinCodeScreenContent from '../../components/pin-code/pin-code-screen-content';
import { hideSplashScreen } from '../../navigators/root/initialRoute';
import { RootNavigationProp, RootRouteProp } from '../../navigators/root/root-navigator-routes';

const hideSplashAndroidOnly = () => (Platform.OS === 'android' ? hideSplashScreen() : undefined);

const PinCodeCheckScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'PinCodeCheck'>>();
  const route = useRoute<RootRouteProp<'PinCodeCheck'>>();

  useFocusEffect(hideSplashAndroidOnly);

  useBlockOSBackNavigation();

  const onFinished = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  return (
    <PinCodeScreenContent
      mode={PinCodeMode.Check}
      onFinished={onFinished}
      disableBiometry={route.params?.disableBiometry}
    />
  );
};

export default PinCodeCheckScreen;
