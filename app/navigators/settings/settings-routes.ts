import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CreateBackupNavigatorParamList } from '../create-backup/create-backup-routes';
import { HistoryNavigatorParamList } from '../history/history-routes';
import { RestoreBackupNavigatorParamList } from '../restore-backup/restore-backup-routes';

export type SettingsNavigatorParamList = {
  AppInformation: undefined;
  BiometricsSet: {
    enabled: boolean;
  };
  CreateBackup: NavigatorScreenParams<CreateBackupNavigatorParamList>;
  Dashboard: undefined;
  DeleteWallet: undefined;
  History: NavigatorScreenParams<HistoryNavigatorParamList>;
  PinCodeChange: undefined;
  PinCodeSet: undefined;
  RestoreBackup: NavigatorScreenParams<RestoreBackupNavigatorParamList>;
};

export type SettingsRouteProp<
  RouteName extends keyof SettingsNavigatorParamList,
> = RouteProp<SettingsNavigatorParamList, RouteName>;
export type SettingsNavigationProp<
  RouteName extends keyof SettingsNavigatorParamList = 'Dashboard',
> = NativeStackNavigationProp<SettingsNavigatorParamList, RouteName>;
