import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import QrCodeScannerScreen from '../../screens/dashboard/qr-code-scanner-screen';
import QRCodeShareScreen from '../../screens/dashboard/qr-code-share-screen';
import WalletScreen from '../../screens/dashboard/wallet-screen';
import { DashboardNavigatorParamList } from './dashboard-routes';

const Stack = createNativeStackNavigator<DashboardNavigatorParamList>();

const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={WalletScreen} name="Wallet" />
      <Stack.Screen component={QrCodeScannerScreen} name="QRCodeScanner" />
      <Stack.Screen
        component={QRCodeShareScreen}
        name="QRCodeShare"
        options={{
          animation:
            Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
          gestureEnabled: false,
          headerShown: false,
          presentation: 'formSheet',
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
