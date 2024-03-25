import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CredentialDetailNavigatorParamList } from '../credential-detail/credential-detail-routes';
import { DashboardNavigatorParamList } from '../dashboard/dashboard-routes';
import { InvitationNavigatorParamList } from '../invitation/invitation-routes';
import { IssueCredentialNavigatorParamList } from '../issue-credential/issue-credential-routes';
import { OnboardingNavigatorParamList } from '../onboarding/onboarding-routes';
import { SettingsNavigatorParamList } from '../settings/settings-routes';
import { ShareCredentialNavigatorParamList } from '../share-credential/share-credential-routes';

export type RootNavigatorParamList = {
  CredentialDetail: NavigatorScreenParams<CredentialDetailNavigatorParamList>;
  Dashboard: NavigatorScreenParams<DashboardNavigatorParamList>;
  ImagePreview: {
    image: string;
    title: string;
  };
  Invitation: NavigatorScreenParams<InvitationNavigatorParamList>;
  IssueCredential: NavigatorScreenParams<IssueCredentialNavigatorParamList>;
  Onboarding?: NavigatorScreenParams<OnboardingNavigatorParamList>;
  PinCodeCheck?: {
    disableBiometry: boolean;
  };
  Settings?: NavigatorScreenParams<SettingsNavigatorParamList>;
  ShareCredential: NavigatorScreenParams<ShareCredentialNavigatorParamList>;
};

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> =
  RouteProp<RootNavigatorParamList, RouteName>;
export type RootNavigationProp<
  RouteName extends keyof RootNavigatorParamList = 'Dashboard',
> = NativeStackNavigationProp<RootNavigatorParamList, RouteName>;
