import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  InvitationResultProofRequest,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
} from 'react-native-one-core';

export type ShareCredentialNavigatorParamList = {
  ProofRequest: { request: InvitationResultProofRequest; selectedCredentialId?: string };
  SelectCredential: {
    request: PresentationDefinitionRequestedCredential;
    preselectedCredentialId: string;
  };
  Processing: {
    interactionId: string;
    credentials: Record<PresentationDefinitionRequestedCredential['id'], PresentationSubmitCredentialRequest>;
  };
};

export type ShareCredentialRouteProp<RouteName extends keyof ShareCredentialNavigatorParamList> = RouteProp<
  ShareCredentialNavigatorParamList,
  RouteName
>;
export type ShareCredentialNavigationProp<RouteName extends keyof ShareCredentialNavigatorParamList> =
  NativeStackNavigationProp<ShareCredentialNavigatorParamList, RouteName>;
