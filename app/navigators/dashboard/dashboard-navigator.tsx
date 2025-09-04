import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import QRCodeNFCScreen from '../../screens/dashboard/qr-code-nfc-screen';
import QrCodeScannerScreen from '../../screens/dashboard/qr-code-scanner-screen';
import QRCodeShareScreen from '../../screens/dashboard/qr-code-share-screen';
import WalletScreen from '../../screens/dashboard/wallet-screen';
import { FORM_SHEET_OPTIONS, formSheetWrapper } from '../navigation-utilities';
import { DashboardNavigatorParamList } from './dashboard-routes';

const QRCodeShare = React.memo(formSheetWrapper(QRCodeShareScreen));
const QRCodeNFC = React.memo(formSheetWrapper(QRCodeNFCScreen));

const Stack = createNativeStackNavigator<DashboardNavigatorParamList>();

const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={WalletScreen} name="Wallet" />
      <Stack.Screen component={QrCodeScannerScreen} name="QRCodeScanner" />
      <Stack.Screen
        component={QRCodeShare}
        name="QRCodeShare"
        options={{
          ...FORM_SHEET_OPTIONS,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        component={QRCodeNFC}
        name="QRCodeNFC"
        options={FORM_SHEET_OPTIONS}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
