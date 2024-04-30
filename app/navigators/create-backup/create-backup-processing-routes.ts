import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type CreateBackupProcessingNavigatorParamList = {
  Creating: {
    password: string;
  };
  Preview: {
    password: string;
  };
};

export type CreateBackupProcessingRouteProp<
  RouteName extends keyof CreateBackupProcessingNavigatorParamList,
> = RouteProp<CreateBackupProcessingNavigatorParamList, RouteName>;
export type CreateBackupProcessingNavigationProp<
  RouteName extends keyof CreateBackupProcessingNavigatorParamList,
> = NativeStackNavigationProp<
  CreateBackupProcessingNavigatorParamList,
  RouteName
>;
