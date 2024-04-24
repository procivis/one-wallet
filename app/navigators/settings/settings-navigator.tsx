import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import AppInformationScreen from '../../screens/settings/app-information-screen';
import BiometricsSetScreen from '../../screens/settings/biometrics-set-screen';
import DashboardScreen from '../../screens/settings/dashboard-screen';
import DeleteWalletProcessScreen from '../../screens/settings/delete-wallet-process-screen';
import DeleteWalletScreen from '../../screens/settings/delete-wallet-screen';
import LicenceDetailsScreen from '../../screens/settings/licence-details-screen';
import LicencesScreen from '../../screens/settings/licences-screen';
import PinCodeChangeScreen from '../../screens/settings/pin-code-change-screen';
import PinCodeSetScreen from '../../screens/settings/pin-code-set-screen';
import CreateBackupNavigator from '../create-backup/create-backup-navigator';
import HistoryNavigator from '../history/history-navigator';
import RestoreBackupNavigator from '../restore-backup/restore-backup-navigator';
import { SettingsNavigatorParamList } from './settings-routes';

const Stack = createNativeStackNavigator<SettingsNavigatorParamList>();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen component={AppInformationScreen} name="AppInformation" />
      <Stack.Screen component={BiometricsSetScreen} name="BiometricsSet" />
      <Stack.Screen component={CreateBackupNavigator} name="CreateBackup" />
      <Stack.Screen component={RestoreBackupNavigator} name="RestoreBackup" />
      <Stack.Screen component={DashboardScreen} name="SettingsDashboard" />
      <Stack.Screen component={DeleteWalletScreen} name="DeleteWallet" />
      <Stack.Screen
        component={DeleteWalletProcessScreen}
        name="DeleteWalletProcess"
        options={{
          animation:
            Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
          headerShown: false,
          presentation: 'formSheet',
        }}
      />
      <Stack.Screen component={HistoryNavigator} name="History" />
      <Stack.Screen component={PinCodeChangeScreen} name="PinCodeChange" />
      <Stack.Screen
        component={PinCodeSetScreen}
        name="PinCodeSet"
        options={{
          animation:
            Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
          headerShown: false,
          presentation: 'formSheet',
        }}
      />
      <Stack.Screen component={LicencesScreen} name="Licences" />
      <Stack.Screen component={LicenceDetailsScreen} name="LicenceDetails" />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
