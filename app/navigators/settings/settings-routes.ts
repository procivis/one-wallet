import { HistoryListItem } from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type SettingsNavigatorParamList = {
  AppInformation: undefined;
  BiometricsSet: {
    enabled: boolean;
  };
  DeleteWallet: undefined;
  History: undefined;
  HistoryDetail: {
    entry: HistoryListItem;
  };
  PinCodeChange: undefined;
  PinCodeSet: undefined;
  SettingsDashboard: undefined;
};

export type SettingsRouteProp<
  RouteName extends keyof SettingsNavigatorParamList,
> = RouteProp<SettingsNavigatorParamList, RouteName>;
export type SettingsNavigationProp<
  RouteName extends keyof SettingsNavigatorParamList = 'SettingsDashboard',
> = NativeStackNavigationProp<SettingsNavigatorParamList, RouteName>;
