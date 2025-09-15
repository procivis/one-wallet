import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import NFCShareScreen from '../../screens/dashboard/nfc-share-screen';
import QrCodeScannerScreen from '../../screens/dashboard/qr-code-scanner-screen';
import QRCodeShareScreen from '../../screens/dashboard/qr-code-share-screen';
import WalletScreen from '../../screens/dashboard/wallet-screen';
import { FORM_SHEET_OPTIONS, formSheetWrapper } from '../navigation-utilities';
import { DashboardNavigatorParamList } from './dashboard-routes';

const QRCodeShare = React.memo(formSheetWrapper(QRCodeShareScreen));
const NFCShare = React.memo(formSheetWrapper(NFCShareScreen));

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
        component={NFCShare}
        name="NFCShare"
        options={FORM_SHEET_OPTIONS}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
