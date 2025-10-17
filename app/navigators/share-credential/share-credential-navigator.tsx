import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ProofProcessScreen from '../../screens/credential/proof-process-screen';
import ProofRequestScreen from '../../screens/credential/proof-request-screen';
import SelectCredentialScreen from '../../screens/credential/proof-request-select-credential-screen';
import SelectCredentialV2Screen from '../../screens/credential/proof-request-select-credential-v2-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { ShareCredentialNavigatorParamList } from './share-credential-routes';

const ProofRequest = React.memo(formSheetWrapper(ProofRequestScreen));
const SelectCredential = React.memo(formSheetWrapper(SelectCredentialScreen));
const SelectCredentialV2 = React.memo(
  formSheetWrapper(SelectCredentialV2Screen),
);
const Processing = React.memo(formSheetWrapper(ProofProcessScreen));

const Stack = createNativeStackNavigator<ShareCredentialNavigatorParamList>();

const ShareCredentialNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ProofRequest} name="ProofRequest" />
      <Stack.Screen component={SelectCredential} name="SelectCredential" />
      <Stack.Screen component={SelectCredentialV2} name="SelectCredentialV2" />
      <Stack.Screen component={Processing} name="Processing" />
    </Stack.Navigator>
  );
};

export default ShareCredentialNavigator;
