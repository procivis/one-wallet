import {
  CredentialQuery,
  HandleInvitationResponse,
  PresentationSubmitV2CredentialRequest,
} from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type InvitationResultProofRequest = Extract<
  HandleInvitationResponse,
  { type_: 'PROOF_REQUEST' }
>;

export type ShareCredentialNavigatorParamList = {
  Processing: {
    credentialsV2: Record<string, PresentationSubmitV2CredentialRequest[]>;
    interactionId: string;
    proofId: string;
  };
  ProofRequest: {
    request: InvitationResultProofRequest;
    selectedCredentialId?: string;
    selectedV2Credentials?: {
      credentialQueryId: string;
      selectedCredentialIds: string[];
    };
  };
  SelectCredentialV2: {
    credentialQuery: CredentialQuery;
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
