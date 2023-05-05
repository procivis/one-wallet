import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type SettingsNavigatorParamList = {
  SettingsDashboard: undefined;
  PinCodeChange: undefined;
  AppInformation: undefined;
  DeleteWallet: undefined;
};

export type SettingsRouteProp<RouteName extends keyof SettingsNavigatorParamList> = RouteProp<
  SettingsNavigatorParamList,
  RouteName
>;
export type SettingsNavigationProp<
  RouteName extends keyof SettingsNavigatorParamList = 'SettingsDashboard'
> = NativeStackNavigationProp<SettingsNavigatorParamList, RouteName>;
