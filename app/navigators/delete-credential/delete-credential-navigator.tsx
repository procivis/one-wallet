import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialDeleteProcessScreen from '../../screens/credential/credential-delete-process-screen';
import CredentialDeletePromptScreen from '../../screens/credential/credential-delete-prompt-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { DeleteCredentialNavigatorParamList } from './delete-credential-routes';

const Prompt = React.memo(formSheetWrapper(CredentialDeletePromptScreen));
const Processing = React.memo(formSheetWrapper(CredentialDeleteProcessScreen));

const Stack = createNativeStackNavigator<DeleteCredentialNavigatorParamList>();

const DeleteCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={Prompt} name="Prompt" />
      <Stack.Screen component={Processing} name="Processing" />
    </Stack.Navigator>
  );
};

export default DeleteCredentialNavigator;
