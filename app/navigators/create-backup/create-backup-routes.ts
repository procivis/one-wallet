import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CreateBackupProcessingNavigatorParamList } from './create-backup-processing-routes';

export type CreateBackupNavigatorParamList = {
  CheckPassword: {
    password: string;
  };
  CreateBackupDashboard:
    | {
        backupFileName: string;
        backupFilePath: string;
      }
    | undefined;
  Processing: NavigatorScreenParams<CreateBackupProcessingNavigatorParamList>;
  SetPassword: undefined;
};

export type CreateBackupRouteProp<
  RouteName extends keyof CreateBackupNavigatorParamList,
> = RouteProp<CreateBackupNavigatorParamList, RouteName>;
export type CreateBackupNavigationProp<
  RouteName extends keyof CreateBackupNavigatorParamList,
> = NativeStackNavigationProp<CreateBackupNavigatorParamList, RouteName>;
