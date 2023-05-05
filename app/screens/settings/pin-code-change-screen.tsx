import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent } from 'react';

import { PinCodeMode } from '../../components/pin-code/pin-code-entry';
import PinCodeScreenContent from '../../components/pin-code/pin-code-screen-content';
import { SettingsNavigationProp } from '../../navigators/root/settings/settings-routes';

const PinCodeChangeScreen: FunctionComponent = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeChange'>>();

  return <PinCodeScreenContent mode={PinCodeMode.Change} onGoBack={navigation.goBack} onFinished={navigation.goBack} />;
};

export default PinCodeChangeScreen;
