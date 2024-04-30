import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import CheckPasswordScreen from '../../screens/create-backup/check-password-screen';
import DashboardScreen from '../../screens/create-backup/dashboard-screen';
import SetPasswordScreen from '../../screens/create-backup/set-password-screen';
import CreateBackupProcessingNavigator from './create-backup-processing-navigator';
import { CreateBackupNavigatorParamList } from './create-backup-routes';

const Stack = createNativeStackNavigator<CreateBackupNavigatorParamList>();

const CreateBackupNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={DashboardScreen} name="CreateBackupDashboard" />
      <Stack.Screen component={SetPasswordScreen} name="SetPassword" />
      <Stack.Screen component={CheckPasswordScreen} name="CheckPassword" />
      <Stack.Screen
        component={CreateBackupProcessingNavigator}
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

export default CreateBackupNavigator;
