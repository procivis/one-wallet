import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PreviewScreen from '../../screens/restore-backup/preview-screen';
import ProcessingScreen from '../../screens/restore-backup/processing-screen';
import UnlockScreen from '../../screens/restore-backup/unlock-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { RestoreBackupProcessingNavigatorParamList } from './restore-backup-processing-routes';

const Stack =
  createNativeStackNavigator<RestoreBackupProcessingNavigatorParamList>();

const RestoreBackupProcessingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={formSheetWrapper(UnlockScreen)} name="Unlock" />
      <Stack.Screen
        component={formSheetWrapper(PreviewScreen)}
        name="Preview"
      />
      <Stack.Screen
        component={formSheetWrapper(ProcessingScreen)}
        name="Restore"
      />
    </Stack.Navigator>
  );
};

export default RestoreBackupProcessingNavigator;
