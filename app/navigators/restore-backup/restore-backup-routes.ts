import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RestoreBackupProcessingNavigatorParamList } from './restore-backup-processing-routes';

export type RestoreBackupNavigatorParamList = {
  Import: undefined;
  Processing: NavigatorScreenParams<RestoreBackupProcessingNavigatorParamList>;
  RecoveryPassword: {
    error?: boolean;
    inputPath: string;
  };
  RestoreBackupDashboard: undefined;
};

export type RestoreBackupRouteProp<
  RouteName extends keyof RestoreBackupNavigatorParamList,
> = RouteProp<RestoreBackupNavigatorParamList, RouteName>;
export type RestoreBackupNavigationProp<
  RouteName extends keyof RestoreBackupNavigatorParamList,
> = NativeStackNavigationProp<RestoreBackupNavigatorParamList, RouteName>;
