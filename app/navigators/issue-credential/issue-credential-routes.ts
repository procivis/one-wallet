import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewCredential } from '../../models/wallet-store/wallet-store-models';

export type IssueCredentialNavigatorParamList = {
  CredentialOffer: { credential: NewCredential };
  Processing: { credential: NewCredential };
};

export type IssueCredentialRouteProp<RouteName extends keyof IssueCredentialNavigatorParamList> = RouteProp<
  IssueCredentialNavigatorParamList,
  RouteName
>;
export type IssueCredentialNavigationProp<RouteName extends keyof IssueCredentialNavigatorParamList> =
  NativeStackNavigationProp<IssueCredentialNavigatorParamList, RouteName>;
