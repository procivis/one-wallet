import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IssueCredentialNavigatorParamList } from '../issue-credential/issue-credential-routes';
import { OnboardingNavigatorParamList } from '../onboarding/onboarding-routes';
import { SettingsNavigatorParamList } from '../settings/settings-routes';
import { TabsNavigatorParamList } from '../tabs/tabs-routes';

export type RootNavigatorParamList = {
  Onboarding?: NavigatorScreenParams<OnboardingNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabsNavigatorParamList>;
  PinCodeCheck?: {
    disableBiometry: boolean;
  };
  Settings?: NavigatorScreenParams<SettingsNavigatorParamList>;
  CredentialDetail: {
    credentialId: string;
  };
  IssueCredential: NavigatorScreenParams<IssueCredentialNavigatorParamList>;
};

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> = RouteProp<
  RootNavigatorParamList,
  RouteName
>;
export type RootNavigationProp<RouteName extends keyof RootNavigatorParamList = 'Tabs'> = NativeStackNavigationProp<
  RootNavigatorParamList,
  RouteName
>;
