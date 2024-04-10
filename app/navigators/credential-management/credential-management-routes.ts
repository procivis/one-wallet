import { CredentialListItem } from '@procivis/react-native-one-core';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { InvitationNavigatorParamList } from '../invitation/invitation-routes';
import { IssueCredentialNavigatorParamList } from '../issue-credential/issue-credential-routes';
import { ShareCredentialNavigatorParamList } from '../share-credential/share-credential-routes';

export type CredentialManagementNavigatorParamList = {
  Invitation: NavigatorScreenParams<InvitationNavigatorParamList>;
  IssueCredential: NavigatorScreenParams<IssueCredentialNavigatorParamList>;
  ShareCredential: NavigatorScreenParams<ShareCredentialNavigatorParamList>;
  StatusCheckResult: {
    credentialIds: Array<CredentialListItem['id']>;
  };
};

export type CredentialManagementRouteProp<
  RouteName extends keyof CredentialManagementNavigatorParamList,
> = RouteProp<CredentialManagementNavigatorParamList, RouteName>;
export type CredentialManagementNavigationProp<
  RouteName extends keyof CredentialManagementNavigatorParamList,
> = NativeStackNavigationProp<
  CredentialManagementNavigatorParamList,
  RouteName
>;
