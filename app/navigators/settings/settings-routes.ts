import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ExternalLibrary, Licence } from '../../models/licences/licences';
import { CreateBackupNavigatorParamList } from '../create-backup/create-backup-routes';
import { HistoryNavigatorParamList } from '../history/history-routes';
import { RestoreBackupNavigatorParamList } from '../restore-backup/restore-backup-routes';

export type SettingsNavigatorParamList = {
  AppInformation: undefined;
  AppInformationNerd: undefined;
  BiometricsSet: {
    enabled: boolean;
  };
  CreateBackup: NavigatorScreenParams<CreateBackupNavigatorParamList>;
  DeleteWallet: undefined;
  DeleteWalletProcess: undefined;
  History: NavigatorScreenParams<HistoryNavigatorParamList>;
  LicenceDetails: {
    library: ExternalLibrary;
    licences: Licence[];
  };
  Licences: undefined;
  PinCodeChange: undefined;
  PinCodeSet: undefined;
  RestoreBackup: NavigatorScreenParams<RestoreBackupNavigatorParamList>;
  SettingsDashboard: undefined;
};

export type SettingsRouteProp<
  RouteName extends keyof SettingsNavigatorParamList,
> = RouteProp<SettingsNavigatorParamList, RouteName>;
export type SettingsNavigationProp<
  RouteName extends keyof SettingsNavigatorParamList = 'SettingsDashboard',
> = NativeStackNavigationProp<SettingsNavigatorParamList, RouteName>;
