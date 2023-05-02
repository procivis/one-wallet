import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TabNavigatorParamList } from './tabs/tabs-navigator';

export type RootNavigatorParamList = {
  Onboarding: undefined;
  Tabs: {
    screen?: keyof TabNavigatorParamList;
  };
  PinCodeCheck?: {
    disableBiometry: boolean;
  };
  Settings: undefined;
  PinCodeChange: undefined;
  AppInformation: undefined;
  DeleteWallet: undefined;
};

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> = RouteProp<
  RootNavigatorParamList,
  RouteName
>;
export type RootNavigationProp<RouteName extends keyof RootNavigatorParamList = 'Tabs'> = NativeStackNavigationProp<
  RootNavigatorParamList,
  RouteName
>;
