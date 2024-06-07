import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialDeleteProcessScreen from '../../screens/credential/credential-delete-process-screen';
import CredentialDeletePromptScreen from '../../screens/credential/credential-delete-prompt-screen';
import { DeleteCredentialNavigatorParamList } from './delete-credential-routes';

const Stack = createNativeStackNavigator<DeleteCredentialNavigatorParamList>();

const DeleteCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={CredentialDeletePromptScreen} name="Prompt" />
      <Stack.Screen
        component={CredentialDeleteProcessScreen}
        name="Processing"
      />
    </Stack.Navigator>
  );
};

export default DeleteCredentialNavigator;
