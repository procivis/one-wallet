import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type CreateBackupNavigatorParamList = {
  Dashboard:
    | {
        backupFileName: string;
        backupFilePath: string;
      }
    | undefined;
  Preview: {
    recoveryPassword: string;
  };
  Processing: {
    recoveryPassword: string;
  };
  RecoveryPassword: undefined;
};

export type CreateBackupRouteProp<
  RouteName extends keyof CreateBackupNavigatorParamList,
> = RouteProp<CreateBackupNavigatorParamList, RouteName>;
export type CreateBackupNavigationProp<
  RouteName extends keyof CreateBackupNavigatorParamList,
> = NativeStackNavigationProp<CreateBackupNavigatorParamList, RouteName>;
