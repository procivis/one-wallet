import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import DashboardScreen from '../../screens/restore-backup/dashboard-screen';
import ImportScreen from '../../screens/restore-backup/import-screen';
import PreviewScreen from '../../screens/restore-backup/preview-screen';
import ProcessingScreen from '../../screens/restore-backup/processing-screen';
import RecoveryPasswordScreen from '../../screens/restore-backup/recovery-password-screen';
import { RestoreBackupNavigatorParamList } from './restore-backup-routes';

const Stack = createNativeStackNavigator<RestoreBackupNavigatorParamList>();

const RestoreBackupNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={DashboardScreen} name="Dashboard" />
      <Stack.Screen component={ImportScreen} name="Import" />
      <Stack.Screen
        component={RecoveryPasswordScreen}
        name="RecoveryPassword"
      />
      <Stack.Screen component={PreviewScreen} name="Preview" />
      <Stack.Screen component={ProcessingScreen} name="Processing" />
    </Stack.Navigator>
  );
};

export default RestoreBackupNavigator;
