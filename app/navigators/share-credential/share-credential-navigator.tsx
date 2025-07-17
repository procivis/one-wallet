import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ProofProcessScreen from '../../screens/credential/proof-process-screen';
import ProofRequestScreen from '../../screens/credential/proof-request-screen';
import SelectCredentialScreen from '../../screens/credential/proof-request-select-credential-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { ShareCredentialNavigatorParamList } from './share-credential-routes';

const Stack = createNativeStackNavigator<ShareCredentialNavigatorParamList>();

const ShareCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        component={formSheetWrapper(ProofRequestScreen)}
        name="ProofRequest"
      />
      <Stack.Screen
        component={formSheetWrapper(SelectCredentialScreen)}
        name="SelectCredential"
      />
      <Stack.Screen
        component={formSheetWrapper(ProofProcessScreen)}
        name="Processing"
      />
    </Stack.Navigator>
  );
};

export default ShareCredentialNavigator;
