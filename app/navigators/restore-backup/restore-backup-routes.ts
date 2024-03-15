import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RestoreBackupNavigatorParamList = {
  Dashboard: undefined;
  Import: undefined;
  Preview: undefined;
  Processing: undefined;
  RecoveryPassword: {
    inputPath: string;
  };
};

export type RestoreBackupRouteProp<
  RouteName extends keyof RestoreBackupNavigatorParamList,
> = RouteProp<RestoreBackupNavigatorParamList, RouteName>;
export type RestoreBackupNavigationProp<
  RouteName extends keyof RestoreBackupNavigatorParamList,
> = NativeStackNavigationProp<RestoreBackupNavigatorParamList, RouteName>;
