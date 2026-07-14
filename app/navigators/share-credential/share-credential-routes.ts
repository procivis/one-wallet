import {
  CredentialQuery,
  HandleInvitationResponse,
  PresentationDefinitionV2,
  PresentationSubmitV2CredentialRequest,
} from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CredentialQuerySelection } from '../../utils/proof-request';

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
    selectedCredentials?: {
      credentialQueryId: string;
      selectedCredentialIds: string[];
    };
    selectedTransactionCredential?: {
      credentialId: string;
      queryId: string;
      transactionId: string;
    };
  };
  SelectCredentialV2: {
    credentialQuery: CredentialQuery;
    credentialQueryId: string;
    navigateBackToTransactions?: boolean;
    preselectedCredentialIds: string[];
  };
  TransactionDetails: {
    credentialQuerySelections: CredentialQuerySelection;
    presentationDefinition: PresentationDefinitionV2;
    proofId: string;
    selectedCredentials?: {
      credentialQueryId: string;
      selectedCredentialIds: string[];
    };
    transactionId: string;
  };
};

export type ShareCredentialRouteProp<
  RouteName extends keyof ShareCredentialNavigatorParamList,
> = RouteProp<ShareCredentialNavigatorParamList, RouteName>;
export type ShareCredentialNavigationProp<
  RouteName extends keyof ShareCredentialNavigatorParamList,
> = NativeStackNavigationProp<ShareCredentialNavigatorParamList, RouteName>;
