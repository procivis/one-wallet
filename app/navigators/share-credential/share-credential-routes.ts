import {
  InvitationResultProofRequest,
  PresentationDefinitionRequestedCredential,
  PresentationDefinitionV2CredentialQuery,
  PresentationSubmitCredentialRequest,
  PresentationSubmitV2CredentialRequest,
} from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type ShareCredentialNavigatorParamList = {
  Processing: {
    interactionId: string;
    proofId: string;
  } & (
    | {
        credentials: Record<
          PresentationDefinitionRequestedCredential['id'],
          PresentationSubmitCredentialRequest
        >;
      }
    | {
        credentialsV2: Record<
          string,
          | PresentationSubmitV2CredentialRequest
          | PresentationSubmitV2CredentialRequest[]
        >;
      }
  );
  ProofRequest: {
    request: InvitationResultProofRequest;
    selectedCredentialId?: string;
    selectedV2Credentials?: {
      credentialQueryId: string;
      selectedCredentialIds: string[];
    };
  };
  SelectCredential: {
    preselectedCredentialId: string;
    request: PresentationDefinitionRequestedCredential;
  };
  SelectCredentialV2: {
    credentialQuery: PresentationDefinitionV2CredentialQuery;
    credentialQueryId: string;
    preselectedCredentialIds: string[];
  };
};

export type ShareCredentialRouteProp<
  RouteName extends keyof ShareCredentialNavigatorParamList,
> = RouteProp<ShareCredentialNavigatorParamList, RouteName>;
export type ShareCredentialNavigationProp<
  RouteName extends keyof ShareCredentialNavigatorParamList,
> = NativeStackNavigationProp<ShareCredentialNavigatorParamList, RouteName>;
