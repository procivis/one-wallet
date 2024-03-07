import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AppInformationScreen from '../../screens/settings/app-information-screen';
import BiometricsSetScreen from '../../screens/settings/biometrics-set-screen';
import DashboardScreen from '../../screens/settings/dashboard-screen';
import DeleteWalletScreen from '../../screens/settings/delete-wallet-screen';
import PinCodeChangeScreen from '../../screens/settings/pin-code-change-screen';
import PinCodeSetScreen from '../../screens/settings/pin-code-set-screen';
import CreateBackupNavigator from '../create-backup/create-backup-navigator';
import HistoryNavigator from '../history/history-navigator';
import { SettingsNavigatorParamList } from './settings-routes';

const Stack = createNativeStackNavigator<SettingsNavigatorParamList>();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen component={AppInformationScreen} name="AppInformation" />
      <Stack.Screen component={BiometricsSetScreen} name="BiometricsSet" />
      <Stack.Screen component={CreateBackupNavigator} name="CreateBackup" />
      <Stack.Screen component={DashboardScreen} name="Dashboard" />
      <Stack.Screen component={DeleteWalletScreen} name="DeleteWallet" />
      <Stack.Screen component={HistoryNavigator} name="History" />
      <Stack.Screen component={PinCodeChangeScreen} name="PinCodeChange" />
      <Stack.Screen component={PinCodeSetScreen} name="PinCodeSet" />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
