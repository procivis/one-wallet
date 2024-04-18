import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type CredentialDetailNavigatorParamList = {
  DeleteProcessing: {
    credentialId: string;
  };
  Detail: {
    credentialId: string;
  };
  History: {
    credentialId: string;
  };
};

export type CredentialDetailRouteProp<
  RouteName extends keyof CredentialDetailNavigatorParamList,
> = RouteProp<CredentialDetailNavigatorParamList, RouteName>;
export type CredentialDetailNavigationProp<
  RouteName extends keyof CredentialDetailNavigatorParamList,
> = NativeStackNavigationProp<CredentialDetailNavigatorParamList, RouteName>;
