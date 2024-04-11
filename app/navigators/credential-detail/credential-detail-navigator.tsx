import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialDeleteProcessScreen from '../../screens/credential/credential-delete-process-screen';
import CredentialDetailScreen from '../../screens/credential/credential-detail-screen';
import { CredentialDetailNavigatorParamList } from './credential-detail-routes';

const Stack = createNativeStackNavigator<CredentialDetailNavigatorParamList>();

const CredentialDetailNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={CredentialDetailScreen} name="Detail" />
      <Stack.Screen
        component={CredentialDeleteProcessScreen}
        name="DeleteProcessing"
      />
    </Stack.Navigator>
  );
};

export default CredentialDetailNavigator;
