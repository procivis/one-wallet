import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import QrCodeScannerScreen from '../../screens/dashboard/qr-code-scanner-screen';
import WalletScreen from '../../screens/dashboard/wallet-screen';
import { DashboardNavigatorParamList } from './dashboard-routes';

const Stack = createNativeStackNavigator<DashboardNavigatorParamList>();

const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={WalletScreen} name="Wallet" />
      <Stack.Screen component={QrCodeScannerScreen} name="QRCodeScanner" />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
