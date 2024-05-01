import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialDetailNerdScreen from '../../screens/nerd-mode/credential-nerd-screen';
import CredentialOfferNerdView from '../../screens/nerd-mode/offer-nerd-screen';
import ProofDetailNerdView from '../../screens/nerd-mode/proof-nerd-screen';
import { NerdModeNavigatorParamList } from './nerd-mode-routes';

const Stack = createNativeStackNavigator<NerdModeNavigatorParamList>();

const NerdModeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ProofDetailNerdView} name="ProofNerdMode" />
      <Stack.Screen
        component={CredentialDetailNerdScreen}
        name="CredentialNerdMode"
      />
      <Stack.Screen component={CredentialOfferNerdView} name="OfferNerdMode" />
    </Stack.Navigator>
  );
};

export default NerdModeNavigator;
