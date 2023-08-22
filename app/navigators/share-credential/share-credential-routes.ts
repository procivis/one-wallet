import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InvitationResultProofRequest } from 'react-native-one-core';

export type ShareCredentialNavigatorParamList = {
  ProofRequest: { request: InvitationResultProofRequest; selectedCredentialId?: string };
  SelectCredential: {
    request: InvitationResultProofRequest;
    preselectedCredentialId: string;
    options: string[]; // credential ids
  };
  Processing: { credentialIds: string[] };
};

export type ShareCredentialRouteProp<RouteName extends keyof ShareCredentialNavigatorParamList> = RouteProp<
  ShareCredentialNavigatorParamList,
  RouteName
>;
export type ShareCredentialNavigationProp<RouteName extends keyof ShareCredentialNavigatorParamList> =
  NativeStackNavigationProp<ShareCredentialNavigatorParamList, RouteName>;
