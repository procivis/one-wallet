import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ProofProcessScreen from '../../screens/credential/proof-process-screen';
import ProofRequestScreen from '../../screens/credential/proof-request-screen';
import SelectCredentialScreen from '../../screens/credential/proof-request-select-credential-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { ShareCredentialNavigatorParamList } from './share-credential-routes';

const ProofRequest = React.memo(formSheetWrapper(ProofRequestScreen));
const SelectCredential = React.memo(formSheetWrapper(SelectCredentialScreen));
const Processing = React.memo(formSheetWrapper(ProofProcessScreen));

const Stack = createNativeStackNavigator<ShareCredentialNavigatorParamList>();

const ShareCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ProofRequest} name="ProofRequest" />
      <Stack.Screen component={SelectCredential} name="SelectCredential" />
      <Stack.Screen component={Processing} name="Processing" />
    </Stack.Navigator>
  );
};

export default ShareCredentialNavigator;
