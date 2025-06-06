import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CredentialAcceptProcessScreen from '../../screens/credential/credential-accept-process-screen';
import CredentialConfirmationCodeScreen from '../../screens/credential/credential-confirmation-code-screen';
import CredentialOfferScreen from '../../screens/credential/credential-offer-screen';
import { RSEAddBiometricsScreen } from '../../screens/rse/rse-add-biometrics-screen';
import { RSEInfoScreen } from '../../screens/rse/rse-information-screen';
import { RSEPinSetupScreen } from '../../screens/rse/rse-pin-setup-screen';
import { FULL_SCREEN_MODAL_OPTIONS } from '../navigation-utilities';
import { IssueCredentialNavigatorParamList } from './issue-credential-routes';

const Stack = createNativeStackNavigator<IssueCredentialNavigatorParamList>();

const IssueCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={CredentialOfferScreen} name="CredentialOffer" />
      <Stack.Screen
        component={CredentialConfirmationCodeScreen}
        name="CredentialConfirmationCode"
      />

      <Stack.Screen
        component={CredentialAcceptProcessScreen}
        name="Processing"
      />
      <Stack.Screen
        component={RSEAddBiometricsScreen}
        name="RSEAddBiometrics"
        options={FULL_SCREEN_MODAL_OPTIONS}
      />
      <Stack.Screen component={RSEInfoScreen} name="RSEInfo" />
      <Stack.Screen
        component={RSEPinSetupScreen}
        name="RSEPinSetup"
        options={FULL_SCREEN_MODAL_OPTIONS}
      />
    </Stack.Navigator>
  );
};

export default IssueCredentialNavigator;
