import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialDeleteProcessScreen from '../../screens/credential/credential-delete-process-screen';
import CredentialDeletePromptScreen from '../../screens/credential/credential-delete-prompt-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { DeleteCredentialNavigatorParamList } from './delete-credential-routes';

const Stack = createNativeStackNavigator<DeleteCredentialNavigatorParamList>();

const DeleteCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        component={formSheetWrapper(CredentialDeletePromptScreen)}
        name="Prompt"
      />
      <Stack.Screen
        component={formSheetWrapper(CredentialDeleteProcessScreen)}
        name="Processing"
      />
    </Stack.Navigator>
  );
};

export default DeleteCredentialNavigator;
