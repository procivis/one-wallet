import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import WalletCentricProcessScreen from '../../screens/sign-document-provider/wallet-centric/process-screen';
import WalletCentricSavedScreen from '../../screens/sign-document-provider/wallet-centric/saved-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { SignDocumentNavigatorParamList } from './sign-document-routes';

const WalletCentricProcess = React.memo(
  formSheetWrapper(WalletCentricProcessScreen),
);

const Stack = createNativeStackNavigator<SignDocumentNavigatorParamList>();

const SignDocumentNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        component={WalletCentricProcess}
        name="WalletCentricProcessScreen"
      />
      <Stack.Screen
        component={WalletCentricSavedScreen}
        name="WalletCentricSavedScreen"
      />
    </Stack.Navigator>
  );
};

export default SignDocumentNavigator;
