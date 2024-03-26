import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type DashboardNavigatorParamList = {
  QRCodeScanner: undefined;
  Wallet: undefined;
};

export type DashboardRouteProp<
  RouteName extends keyof DashboardNavigatorParamList,
> = RouteProp<DashboardNavigatorParamList, RouteName>;
export type DashboardNavigationProp<
  RouteName extends keyof DashboardNavigatorParamList,
> = NativeStackNavigationProp<DashboardNavigatorParamList, RouteName>;
