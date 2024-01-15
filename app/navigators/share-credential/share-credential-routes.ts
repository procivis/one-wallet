import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  InvitationResultProofRequest,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
} from '@procivis/react-native-one-core';

export type ShareCredentialNavigatorParamList = {
  Processing: {
    credentials: Record<
      PresentationDefinitionRequestedCredential['id'],
      PresentationSubmitCredentialRequest
    >;
    interactionId: string;
    proofId: string;
  };
  ProofRequest: {
    request: InvitationResultProofRequest;
    selectedCredentialId?: string;
  };
  SelectCredential: {
    preselectedCredentialId: string;
    request: PresentationDefinitionRequestedCredential;
  };
};

export type ShareCredentialRouteProp<
  RouteName extends keyof ShareCredentialNavigatorParamList,
> = RouteProp<ShareCredentialNavigatorParamList, RouteName>;
export type ShareCredentialNavigationProp<
  RouteName extends keyof ShareCredentialNavigatorParamList,
> = NativeStackNavigationProp<ShareCredentialNavigatorParamList, RouteName>;
