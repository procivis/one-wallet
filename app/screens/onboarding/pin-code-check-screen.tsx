import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';

import { PinCodeMode } from '../../components/pin-code/pin-code-entry';
import PinCodeScreenContent from '../../components/pin-code/pin-code-screen-content';
import { RootNavigationProp, RootRouteProp } from '../../navigators/root/root-navigator-routes';

const PinCodeCheckScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'PinCodeCheck'>>();
  const route = useRoute<RootRouteProp<'PinCodeCheck'>>();

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
