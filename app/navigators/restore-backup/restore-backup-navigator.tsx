import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import DashboardScreen from '../../screens/restore-backup/dashboard-screen';
import ImportScreen from '../../screens/restore-backup/import-screen';
import RecoveryPasswordScreen from '../../screens/restore-backup/recovery-password-screen';
import { FORM_SHEET_OPTIONS } from '../navigation-utilities';
import RestoreBackupProcessingNavigator from './restore-backup-processing-navigator';
import { RestoreBackupNavigatorParamList } from './restore-backup-routes';

const Stack = createNativeStackNavigator<RestoreBackupNavigatorParamList>();

const RestoreBackupNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={DashboardScreen} name="RestoreBackupDashboard" />
      <Stack.Screen component={ImportScreen} name="Import" />
      <Stack.Screen
        component={RecoveryPasswordScreen}
        name="RecoveryPassword"
      />
      <Stack.Screen
        component={RestoreBackupProcessingNavigator}
        name="Processing"
        options={FORM_SHEET_OPTIONS}
      />
    </Stack.Navigator>
  );
};

export default RestoreBackupNavigator;
