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
      <Stack.Screen name="ProofRequest" component={ProofRequestScreen} />
      <Stack.Screen name="SelectCredential" component={SelectCredentialScreen} />
      <Stack.Screen name="Processing" component={ProofProcessScreen} />
    </Stack.Navigator>
  );
};

export default ShareCredentialNavigator;
