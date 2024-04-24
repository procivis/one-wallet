import { CredentialListItem } from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type DeleteCredentialNavigatorParamList = {
  Processing: {
    credentialId: CredentialListItem['id'];
  };
  Prompt: {
    credentialId: CredentialListItem['id'];
  };
};

export type DeleteCredentialRouteProp<
  RouteName extends keyof DeleteCredentialNavigatorParamList,
> = RouteProp<DeleteCredentialNavigatorParamList, RouteName>;
export type DeleteCredentialNavigationProp<
  RouteName extends keyof DeleteCredentialNavigatorParamList,
> = NativeStackNavigationProp<DeleteCredentialNavigatorParamList, RouteName>;
