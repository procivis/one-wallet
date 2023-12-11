import { navigationTabsDecorator, NavigationTabsLayoutVariant } from '@procivis/react-native-components';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { SvgProps } from 'react-native-svg';

import { DashboardIcon, QRIcon } from '../../components/icon/nav-bar-icon';
import { useRuntimeDeepLinkHandling } from '../../hooks/deep-link';
import { useUpdatedTranslate } from '../../i18n';
import QRCodeScannerScreen from '../../screens/dashboard/qr-code-scanner-screen';
import WalletScreen from '../../screens/dashboard/wallet-screen';
import { TabsNavigatorParamList } from './tabs-routes';

const iconFactory = (Icon: React.ComponentType<SvgProps>) => {
  const IconImage: BottomTabNavigationOptions['tabBarIcon'] = ({ color }) => <Icon color={color} />;
  return IconImage;
};

const Tab = createBottomTabNavigator<TabsNavigatorParamList>();

const TabsNavigator = () => {
  const translate = useUpdatedTranslate();

  const isFocused = useIsFocused();
  useRuntimeDeepLinkHandling(isFocused);

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
