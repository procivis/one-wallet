import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent } from 'react';

import { PinCodeMode } from '../../components/pin-code/pin-code-entry';
import PinCodeScreenContent from '../../components/pin-code/pin-code-screen-content';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

const PinCodeChangeScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'PinCodeChange'>>();

  return <PinCodeScreenContent mode={PinCodeMode.Change} onGoBack={navigation.goBack} onFinished={navigation.goBack} />;
};

export default PinCodeChangeScreen;
