import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AppInformationScreen from '../../screens/settings/app-information-screen';
import BiometricsSetScreen from '../../screens/settings/biometrics-set-screen';
import DeleteWalletScreen from '../../screens/settings/delete-wallet-screen';
import HistoryScreen from '../../screens/settings/history-screen';
import PinCodeChangeScreen from '../../screens/settings/pin-code-change-screen';
import PinCodeSetScreen from '../../screens/settings/pin-code-set-screen';
import SettingsScreen from '../../screens/settings/settings-screen';
import { SettingsNavigatorParamList } from './settings-routes';

const Stack = createNativeStackNavigator<SettingsNavigatorParamList>();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen component={SettingsScreen} name="SettingsDashboard" />
      <Stack.Screen component={HistoryScreen} name="History" />
      <Stack.Screen component={PinCodeChangeScreen} name="PinCodeChange" />
      <Stack.Screen component={PinCodeSetScreen} name="PinCodeSet" />
      <Stack.Screen component={BiometricsSetScreen} name="BiometricsSet" />
      <Stack.Screen component={AppInformationScreen} name="AppInformation" />
      <Stack.Screen component={DeleteWalletScreen} name="DeleteWallet" />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
