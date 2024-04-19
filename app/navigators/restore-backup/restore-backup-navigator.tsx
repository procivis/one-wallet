import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import DashboardScreen from '../../screens/restore-backup/dashboard-screen';
import ImportScreen from '../../screens/restore-backup/import-screen';
import RecoveryPasswordScreen from '../../screens/restore-backup/recovery-password-screen';
import RestoreBackupProcessingNavigator from './restore-backup-processing-navigator';
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
      <Stack.Screen
        component={RestoreBackupProcessingNavigator}
        name="Processing"
        options={{
          animation:
            Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
          headerShown: false,
          presentation: 'formSheet',
        }}
      />
    </Stack.Navigator>
  );
};

export default RestoreBackupNavigator;
