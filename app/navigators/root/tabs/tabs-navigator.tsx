import { navigationTabsDecorator, NavigationTabsLayoutVariant } from '@procivis/react-native-components';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';

import { translate } from '../../../i18n';
import QRCodeScannerScreen from '../../../screens/scanner/qr-code-scanner-screen';
import WalletScreen from '../../../screens/wallet/wallet-screen';

const ConnectIcon = require('../../../../assets/images/navbar/nav-connect.png');
const WalletIcon = require('../../../../assets/images/navbar/nav-wallet.png');

const iconFactory = (source: ImageSourcePropType) => {
  const IconImage = (props: { focused: boolean; color: string; size: number }) => (
    <Image source={source} style={{ tintColor: props.color }} />
  );
  return IconImage;
};

export type TabNavigatorParamList = {
  QRCodeScanner: undefined;
  Wallet: undefined;
  Services: undefined;
};

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

const TabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
      }}
      tabBar={navigationTabsDecorator(NavigationTabsLayoutVariant.Floating)}
      backBehavior="initialRoute"
      initialRouteName="Wallet">
      <Tab.Screen
        name="QRCodeScanner"
        options={{
          tabBarLabel: translate('wallet.tabBar.qrCodeScanner'),
          tabBarIcon: iconFactory(ConnectIcon),
        }}
        component={QRCodeScannerScreen}
      />
      <Tab.Screen
        name="Wallet"
        options={{
          tabBarLabel: translate('wallet.tabBar.wallet'),
          tabBarIcon: iconFactory(WalletIcon),
        }}
        component={WalletScreen}
      />
    </Tab.Navigator>
  );
};

export default TabsNavigator;
