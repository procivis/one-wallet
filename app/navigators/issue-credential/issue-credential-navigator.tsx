import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import CredentialAcceptProcessScreen from '../../screens/credential/credential-accept-process-screen';
import CredentialOfferNerdView from '../../screens/credential/credential-offer-nerd-screen';
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
      <Stack.Screen
        component={CredentialOfferNerdView}
        name="CredentialOfferNerdScreen"
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

export default IssueCredentialNavigator;
