import { OpenID4VCITxCode } from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type IssueCredentialNavigatorParamList = {
  CredentialConfirmationCode: {
    credentialId: string;
    interactionId: string;
    invalidCode?: string;
    txCode: OpenID4VCITxCode;
  };
  CredentialOffer: {
    credentialId: string;
    interactionId: string;
    txCode?: OpenID4VCITxCode;
  };
  Processing: {
    credentialId: string;
    interactionId: string;
    txCode?: OpenID4VCITxCode;
    txCodeValue?: string;
  };
};

export type IssueCredentialRouteProp<
  RouteName extends keyof IssueCredentialNavigatorParamList,
> = RouteProp<IssueCredentialNavigatorParamList, RouteName>;
export type IssueCredentialNavigationProp<
  RouteName extends keyof IssueCredentialNavigatorParamList,
> = NativeStackNavigationProp<IssueCredentialNavigatorParamList, RouteName>;
