import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PreviewScreen from '../../screens/restore-backup/preview-screen';
import ProcessingScreen from '../../screens/restore-backup/processing-screen';
import UnlockScreen from '../../screens/restore-backup/unlock-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { RestoreBackupProcessingNavigatorParamList } from './restore-backup-processing-routes';

const Unlock = React.memo(formSheetWrapper(UnlockScreen));
const Preview = React.memo(formSheetWrapper(PreviewScreen));
const Restore = React.memo(formSheetWrapper(ProcessingScreen));

const Stack =
  createNativeStackNavigator<RestoreBackupProcessingNavigatorParamList>();

const RestoreBackupProcessingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={Unlock} name="Unlock" />
      <Stack.Screen component={Preview} name="Preview" />
      <Stack.Screen component={Restore} name="Restore" />
    </Stack.Navigator>
  );
};

export default RestoreBackupProcessingNavigator;
