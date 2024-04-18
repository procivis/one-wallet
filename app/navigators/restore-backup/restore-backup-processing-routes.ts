import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RestoreBackupProcessingNavigatorParamList = {
  Preview: undefined;
  Restore: undefined;
  Unlock: {
    inputPath: string;
    password: string;
  };
};

export type RestoreBackupProcessingRouteProp<
  RouteName extends keyof RestoreBackupProcessingNavigatorParamList,
> = RouteProp<RestoreBackupProcessingNavigatorParamList, RouteName>;
export type RestoreBackupProcessingNavigationProp<
  RouteName extends keyof RestoreBackupProcessingNavigatorParamList,
> = NativeStackNavigationProp<
  RestoreBackupProcessingNavigatorParamList,
  RouteName
>;
