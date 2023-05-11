import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

export type TabsNavigatorParamList = {
  QRCodeScanner: undefined;
  Wallet: undefined;
};

export type TabsRouteProp<RouteName extends keyof TabsNavigatorParamList> = RouteProp<
  TabsNavigatorParamList,
  RouteName
>;
export type TabsNavigationProp<RouteName extends keyof TabsNavigatorParamList> = BottomTabNavigationProp<
  TabsNavigatorParamList,
  RouteName
>;
