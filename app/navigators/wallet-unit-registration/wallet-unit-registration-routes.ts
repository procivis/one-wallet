import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type WalletUnitRegistrationParams = {
  operation: 'refresh' | 'register';
  resetToDashboard?: boolean | 'onError';
};

export type WalletUnitRegistrationNavigatorParamList = {
  Info: WalletUnitRegistrationParams;
  Login: WalletUnitRegistrationParams;
  Registration: WalletUnitRegistrationParams & {
    code?: string;
  };
};

export type WalletUnitRegistrationRouteProp<
  RouteName extends keyof WalletUnitRegistrationNavigatorParamList,
> = RouteProp<WalletUnitRegistrationNavigatorParamList, RouteName>;
export type WalletUnitRegistrationNavigationProp<
  RouteName extends keyof WalletUnitRegistrationNavigatorParamList,
> = NativeStackNavigationProp<
  WalletUnitRegistrationNavigatorParamList,
  RouteName
>;
