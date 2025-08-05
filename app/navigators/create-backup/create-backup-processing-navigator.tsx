import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CreatingScreen from '../../screens/create-backup/creating-screen';
import PreviewScreen from '../../screens/create-backup/preview-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { CreateBackupProcessingNavigatorParamList } from './create-backup-processing-routes';

const Preview = React.memo(formSheetWrapper(PreviewScreen));
const Creating = React.memo(formSheetWrapper(CreatingScreen));

const Stack =
  createNativeStackNavigator<CreateBackupProcessingNavigatorParamList>();

const CreateBackupProcessingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={Preview} name="Preview" />
      <Stack.Screen component={Creating} name="Creating" />
    </Stack.Navigator>
  );
};

export default CreateBackupProcessingNavigator;
