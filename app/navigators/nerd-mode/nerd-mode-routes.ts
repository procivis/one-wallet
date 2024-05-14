import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type NerdModeNavigatorParamList = {
  CredentialNerdMode: {
    credentialId: string;
  };
  ErrorNerdMode: {
    error: Error | unknown;
  };
  OfferNerdMode: {
    credentialId: string;
  };
  ProofNerdMode: {
    proofId: string;
  };
};

export type NerdModeRouteProp<
  RouteName extends keyof NerdModeNavigatorParamList,
> = RouteProp<NerdModeNavigatorParamList, RouteName>;
export type NerdModeNavigationProp<
  RouteName extends keyof NerdModeNavigatorParamList,
> = NativeStackNavigationProp<NerdModeNavigatorParamList, RouteName>;
