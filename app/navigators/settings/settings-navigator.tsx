import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { RSEAddBiometricsScreen } from '../../screens/rse/rse-add-biometrics-screen';
import { RSEChangePinScreen } from '../../screens/rse/rse-change-pin-screen';
import AppInformationNerdScreen from '../../screens/settings/app-information-nerd-screen';
import AppInformationScreen from '../../screens/settings/app-information-screen';
import BiometricsSetScreen from '../../screens/settings/biometrics-set-screen';
import ClearCacheScreen from '../../screens/settings/clear-cache-screen';
import DashboardScreen from '../../screens/settings/dashboard-screen';
import DeleteWalletProcessScreen from '../../screens/settings/delete-wallet-process-screen';
import DeleteWalletScreen from '../../screens/settings/delete-wallet-screen';
import LicenceDetailsScreen from '../../screens/settings/licence-details-screen';
import LicencesScreen from '../../screens/settings/licences-screen';
import PinCodeChangeScreen from '../../screens/settings/pin-code-change-screen';
import PinCodeSetScreen from '../../screens/settings/pin-code-set-screen';
import CreateBackupNavigator from '../create-backup/create-backup-navigator';
import HistoryNavigator from '../history/history-navigator';
import {
  FORM_SHEET_OPTIONS,
  FULL_SCREEN_MODAL_OPTIONS,
} from '../navigation-utilities';
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
      <Stack.Screen
        component={AppInformationNerdScreen}
        name="AppInformationNerd"
        options={FULL_SCREEN_MODAL_OPTIONS}
      />
      <Stack.Group screenOptions={FORM_SHEET_OPTIONS}>
        <Stack.Screen component={BiometricsSetScreen} name="BiometricsSet" />
        <Stack.Screen
          component={DeleteWalletProcessScreen}
          name="DeleteWalletProcess"
        />
        <Stack.Screen component={PinCodeSetScreen} name="PinCodeSet" />
      </Stack.Group>

      <Stack.Screen component={CreateBackupNavigator} name="CreateBackup" />
      <Stack.Screen component={RestoreBackupNavigator} name="RestoreBackup" />
      <Stack.Screen component={DashboardScreen} name="SettingsDashboard" />
      <Stack.Screen component={DeleteWalletScreen} name="DeleteWallet" />

      <Stack.Screen component={ClearCacheScreen} name="ClearCache" />
      <Stack.Screen component={HistoryNavigator} name="History" />
      <Stack.Screen component={PinCodeChangeScreen} name="PinCodeChange" />

      <Stack.Screen
        component={RSEAddBiometricsScreen}
        name="RSEAddBiometrics"
        options={FULL_SCREEN_MODAL_OPTIONS}
      />
      <Stack.Screen component={RSEChangePinScreen} name="RSEPinCodeChange" />
      <Stack.Screen component={LicencesScreen} name="Licences" />
      <Stack.Screen component={LicenceDetailsScreen} name="LicenceDetails" />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
