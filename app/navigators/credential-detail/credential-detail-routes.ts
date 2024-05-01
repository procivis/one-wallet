import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DeleteCredentialNavigatorParamList } from '../delete-credential/delete-credential-routes';

export type CredentialDetailNavigatorParamList = {
  Delete: NavigatorScreenParams<DeleteCredentialNavigatorParamList>;
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
