import {
  CredentialQueryResponseBindingDto,
  HandleInvitationResponseBindingEnum,
  PresentationDefinitionRequestedCredentialBindingDto,
  PresentationSubmitCredentialRequestBindingDto,
  PresentationSubmitV2CredentialRequestBindingDto,
} from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type InvitationResultProofRequest = Extract<
  HandleInvitationResponseBindingEnum,
  { type_: 'PROOF_REQUEST' }
>;

export type ShareCredentialNavigatorParamList = {
  Processing: {
    interactionId: string;
    proofId: string;
  } & (
    | {
        credentials: Record<
          PresentationDefinitionRequestedCredentialBindingDto['id'],
          PresentationSubmitCredentialRequestBindingDto[]
        >;
      }
    | {
        credentialsV2: Record<
          string,
          PresentationSubmitV2CredentialRequestBindingDto[]
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
    request: PresentationDefinitionRequestedCredentialBindingDto;
  };
  SelectCredentialV2: {
    credentialQuery: CredentialQueryResponseBindingDto;
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
