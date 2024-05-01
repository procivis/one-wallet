import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type NerdModeNavigatorParamList = {
  CredentialNerdMode: {
    credentialId: string;
  };
  OfferNerdMode: {
    credentialId: string;
  };
  ProofNerdMode: {
    proofId: string;
  };
};

export type NerdModeNavigatorProp<
  RouteName extends keyof NerdModeNavigatorParamList,
> = RouteProp<NerdModeNavigatorParamList, RouteName>;
export type IssueCredentialNavigationProp<
  RouteName extends keyof NerdModeNavigatorParamList,
> = NativeStackNavigationProp<NerdModeNavigatorParamList, RouteName>;
