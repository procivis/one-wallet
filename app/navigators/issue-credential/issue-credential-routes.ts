import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type IssueCredentialNavigatorParamList = {
  CredentialOffer: {
    credentialId: string;
    interactionId: string;
  };
  CredentialOfferNerdScreen: {
    credentialId: string;
  };
  Processing: {
    credentialId: string;
    interactionId: string;
  };
};

export type IssueCredentialRouteProp<
  RouteName extends keyof IssueCredentialNavigatorParamList,
> = RouteProp<IssueCredentialNavigatorParamList, RouteName>;
export type IssueCredentialNavigationProp<
  RouteName extends keyof IssueCredentialNavigatorParamList,
> = NativeStackNavigationProp<IssueCredentialNavigatorParamList, RouteName>;
