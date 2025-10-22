import { InvitationResultCredentialIssuance } from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type IssueCredentialNavigatorParamList = {
  CredentialConfirmationCode: {
    invalidCode?: string;
    invitationResult: InvitationResultCredentialIssuance;
  };
  CredentialOffer: {
    invitationResult: InvitationResultCredentialIssuance;
    txCode?: string;
  };
  RSEAddBiometrics: undefined;
  RSEInfo: {
    invitationResult: InvitationResultCredentialIssuance;
    txCode?: string;
  };
  RSEPinSetup: undefined;
  Result: {
    error?: unknown;
    redirectUri?: string;
  };
};

export type IssueCredentialRouteProp<
  RouteName extends keyof IssueCredentialNavigatorParamList,
> = RouteProp<IssueCredentialNavigatorParamList, RouteName>;
export type IssueCredentialNavigationProp<
  RouteName extends keyof IssueCredentialNavigatorParamList,
> = NativeStackNavigationProp<IssueCredentialNavigatorParamList, RouteName>;
