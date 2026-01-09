import { CredentialListItemBindingDto } from '@procivis/react-native-one-core';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageSourcePropType } from 'react-native';

import { CredentialDetailNavigatorParamList } from '../credential-detail/credential-detail-routes';
import { CredentialManagementNavigatorParamList } from '../credential-management/credential-management-routes';
import { DashboardNavigatorParamList } from '../dashboard/dashboard-routes';
import { NerdModeNavigatorParamList } from '../nerd-mode/nerd-mode-routes';
import { OnboardingNavigatorParamList } from '../onboarding/onboarding-routes';
import { SettingsNavigatorParamList } from '../settings/settings-routes';

export type RootNavigatorParamList = {
  CredentialDetailBindingDto: NavigatorScreenParams<CredentialDetailNavigatorParamList>;
  CredentialManagement: NavigatorScreenParams<CredentialManagementNavigatorParamList>;
  CredentialUpdateProcess: {
    credentialId: CredentialListItemBindingDto['id'];
  };
  Dashboard: NavigatorScreenParams<DashboardNavigatorParamList>;
  ImagePreview: {
    image: string | ImageSourcePropType;
    title: string;
  };
  NerdMode: NavigatorScreenParams<NerdModeNavigatorParamList>;
  Onboarding?: NavigatorScreenParams<OnboardingNavigatorParamList>;
  PinCodeCheck?: {
    disableBiometry: boolean;
  };
  RSESign: undefined;
  RequestCredentialList: undefined;
  Settings?: NavigatorScreenParams<SettingsNavigatorParamList>;
  StatusCheckResult: {
    credentialIds: Array<CredentialListItemBindingDto['id']>;
  };
  VersionUpdate: undefined;
  WalletUnitError: undefined;
  WalletUnitRegistration: {
    attestationRequired?: boolean;
    operation: 'refresh' | 'register';
    resetToDashboard?: boolean | 'onError';
  };
};

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> =
  RouteProp<RootNavigatorParamList, RouteName>;
export type RootNavigationProp<
  RouteName extends keyof RootNavigatorParamList = 'Dashboard',
> = NativeStackNavigationProp<RootNavigatorParamList, RouteName>;
