import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialAcceptProcessScreen from '../../screens/credential/credential-accept-process-screen';
import CredentialOfferDetailScreen from '../../screens/credential/credential-offer-detail-screen';
import CredentialOfferScreen from '../../screens/credential/credential-offer-screen';
import { IssueCredentialNavigatorParamList } from './issue-credential-routes';

const Stack = createNativeStackNavigator<IssueCredentialNavigatorParamList>();

const IssueCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CredentialOffer" component={CredentialOfferScreen} />
      <Stack.Screen name="CredentialOfferDetail" component={CredentialOfferDetailScreen} />
      <Stack.Screen name="Processing" component={CredentialAcceptProcessScreen} />
    </Stack.Navigator>
  );
};

export default IssueCredentialNavigator;
