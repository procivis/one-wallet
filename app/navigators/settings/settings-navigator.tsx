import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AppInformationScreen from '../../screens/settings/app-information-screen';
import DeleteWalletScreen from '../../screens/settings/delete-wallet-screen';
import PinCodeChangeScreen from '../../screens/settings/pin-code-change-screen';
import SettingsScreen from '../../screens/settings/settings-screen';
import { SettingsNavigatorParamList } from './settings-routes';

const Stack = createNativeStackNavigator<SettingsNavigatorParamList>();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SettingsDashboard">
      <Stack.Screen name="SettingsDashboard" component={SettingsScreen} />
      <Stack.Screen name="AppInformation" component={AppInformationScreen} />
      <Stack.Screen name="DeleteWallet" component={DeleteWalletScreen} />
      <Stack.Screen name="PinCodeChange" component={PinCodeChangeScreen} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
