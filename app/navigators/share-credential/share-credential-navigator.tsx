import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import ProofProcessScreen from '../../screens/credential/proof-process-screen';
import ProofRequestNerdView from '../../screens/credential/proof-request-nerd-screen';
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
      <Stack.Screen
        component={ProofRequestNerdView}
        name="ProofRequestNerdScreen"
        options={{
          animation:
            Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
};

export default ShareCredentialNavigator;
