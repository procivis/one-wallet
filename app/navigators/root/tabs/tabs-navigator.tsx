import { navigationTabsDecorator, NavigationTabsLayoutVariant } from '@procivis/react-native-components';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { SvgProps } from 'react-native-svg';

import { DashboardIcon, QRIcon } from '../../../../assets/images/navbar/nav-bar-icon';
import { translate } from '../../../i18n';
import QRCodeScannerScreen from '../../../screens/scanner/qr-code-scanner-screen';
import WalletScreen from '../../../screens/wallet/wallet-screen';

const iconFactory = (Icon: React.ComponentType<SvgProps>) => {
  const IconImage: BottomTabNavigationOptions['tabBarIcon'] = ({ color }) => <Icon color={color} />;
  return IconImage;
};

export type TabNavigatorParamList = {
  QRCodeScanner: undefined;
  Wallet: undefined;
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
          tabBarIcon: iconFactory(QRIcon),
        }}
        component={QRCodeScannerScreen}
      />
      <Tab.Screen
        name="Wallet"
        options={{
          tabBarLabel: translate('wallet.tabBar.wallet'),
          tabBarIcon: iconFactory(DashboardIcon),
        }}
        component={WalletScreen}
      />
    </Tab.Navigator>
  );
};

export default TabsNavigator;
