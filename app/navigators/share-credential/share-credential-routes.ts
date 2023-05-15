import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ProofRequestAttribute {
  key: string;
  mandatory: boolean;
}
export interface ProofRequest {
  verifier: string;
  credentialSchema: string;
  credentialFormat: string;
  revocationMethod: string;
  transport: string;
  attributes: ProofRequestAttribute[];
}

export type ShareCredentialNavigatorParamList = {
  ProofRequest: { request: ProofRequest; selectedCredentialId?: string };
  SelectCredential: { selectedCredentialId: string; request: ProofRequest };
  Processing: { request: ProofRequest; credentialId: string };
};

export type ShareCredentialRouteProp<RouteName extends keyof ShareCredentialNavigatorParamList> = RouteProp<
  ShareCredentialNavigatorParamList,
  RouteName
>;
export type ShareCredentialNavigationProp<RouteName extends keyof ShareCredentialNavigatorParamList> =
  NativeStackNavigationProp<ShareCredentialNavigatorParamList, RouteName>;
