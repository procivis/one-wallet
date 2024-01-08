import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ProofProcessScreen from '../../screens/credential/proof-process-screen';
import ProofRequestScreen from '../../screens/credential/proof-request-screen';
import SelectCredentialScreen from '../../screens/credential/proof-request-select-credential-screen';
import { ShareCredentialNavigatorParamList } from './share-credential-routes';

const Stack = createNativeStackNavigator<ShareCredentialNavigatorParamList>();

const ShareCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ProofRequestScreen} name="ProofRequest" />
      <Stack.Screen
        component={SelectCredentialScreen}
        name="SelectCredential"
      />
      <Stack.Screen component={ProofProcessScreen} name="Processing" />
    </Stack.Navigator>
  );
};

export default ShareCredentialNavigator;
