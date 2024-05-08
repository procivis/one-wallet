import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialAcceptProcessScreen from '../../screens/credential/credential-accept-process-screen';
import CredentialOfferScreen from '../../screens/credential/credential-offer-screen';
import { IssueCredentialNavigatorParamList } from './issue-credential-routes';

const Stack = createNativeStackNavigator<IssueCredentialNavigatorParamList>();

const IssueCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={CredentialOfferScreen} name="CredentialOffer" />
      <Stack.Screen
        component={CredentialAcceptProcessScreen}
        name="Processing"
      />
    </Stack.Navigator>
  );
};

export default IssueCredentialNavigator;
