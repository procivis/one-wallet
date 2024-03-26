import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageSourcePropType } from 'react-native';

import { CredentialDetailNavigatorParamList } from '../credential-detail/credential-detail-routes';
import { CredentialManagementNavigatorParamList } from '../credential-management/credential-management-routes';
import { DashboardNavigatorParamList } from '../dashboard/dashboard-routes';
import { OnboardingNavigatorParamList } from '../onboarding/onboarding-routes';
import { SettingsNavigatorParamList } from '../settings/settings-routes';

export type RootNavigatorParamList = {
  CredentialDetail: NavigatorScreenParams<CredentialDetailNavigatorParamList>;
  CredentialManagement: NavigatorScreenParams<CredentialManagementNavigatorParamList>;
  Dashboard: NavigatorScreenParams<DashboardNavigatorParamList>;
  ImagePreview: {
    image: string | ImageSourcePropType;
    title: string;
  };
  Onboarding?: NavigatorScreenParams<OnboardingNavigatorParamList>;
  PinCodeCheck?: {
    disableBiometry: boolean;
  };
  Settings?: NavigatorScreenParams<SettingsNavigatorParamList>;
};

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> =
  RouteProp<RootNavigatorParamList, RouteName>;
export type RootNavigationProp<
  RouteName extends keyof RootNavigatorParamList = 'Dashboard',
> = NativeStackNavigationProp<RootNavigatorParamList, RouteName>;
