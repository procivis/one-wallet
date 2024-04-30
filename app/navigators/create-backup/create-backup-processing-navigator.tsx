import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CreatingScreen from '../../screens/create-backup/creating-screen';
import PreviewScreen from '../../screens/create-backup/preview-screen';
import { CreateBackupProcessingNavigatorParamList } from './create-backup-processing-routes';

const Stack =
  createNativeStackNavigator<CreateBackupProcessingNavigatorParamList>();

const CreateBackupProcessingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={PreviewScreen} name="Preview" />
      <Stack.Screen component={CreatingScreen} name="Creating" />
    </Stack.Navigator>
  );
};

export default CreateBackupProcessingNavigator;
