import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import DashboardScreen from '../../screens/create-backup/dashboard-screen';
import PreviewScreen from '../../screens/create-backup/preview-screen';
import ProcessingScreen from '../../screens/create-backup/processing-screen';
import RecoveryPasswordScreen from '../../screens/create-backup/recovery-password-screen';
import { CreateBackupNavigatorParamList } from './create-backup-routes';

const Stack = createNativeStackNavigator<CreateBackupNavigatorParamList>();

const CreateBackupNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={DashboardScreen} name="CreateBackupDashboard" />
      <Stack.Screen
        component={RecoveryPasswordScreen}
        name="RecoveryPassword"
      />
      <Stack.Screen component={PreviewScreen} name="Preview" />
      <Stack.Screen component={ProcessingScreen} name="Processing" />
    </Stack.Navigator>
  );
};

export default CreateBackupNavigator;
