import {
  CredentialListItem,
  TrustInformationDetail,
} from '@procivis/react-native-one-core';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageSourcePropType } from 'react-native';

import { TrustEcosystemsRouteParams } from '../../screens/trust-ecosystems/trust-ecosystems-screen';
import { CredentialDetailNavigatorParamList } from '../credential-detail/credential-detail-routes';
import { CredentialManagementNavigatorParamList } from '../credential-management/credential-management-routes';
import { DashboardNavigatorParamList } from '../dashboard/dashboard-routes';
import { NerdModeNavigatorParamList } from '../nerd-mode/nerd-mode-routes';
import { OnboardingNavigatorParamList } from '../onboarding/onboarding-routes';
import { SettingsNavigatorParamList } from '../settings/settings-routes';
import { SignDocumentNavigatorParamList } from '../sign-document/sign-document-routes';
import { WalletUnitRegistrationParams } from '../wallet-unit-registration/wallet-unit-registration-routes';

export type RootNavigatorParamList = {
  CredentialDetail: NavigatorScreenParams<CredentialDetailNavigatorParamList>;
  CredentialManagement: NavigatorScreenParams<CredentialManagementNavigatorParamList>;
  CredentialRefresh: {
    credentialId: CredentialListItem['id'];
    interactionId: CredentialListItem['id'];
  };
  CredentialStatusUpdateProcess: {
    credentialId: CredentialListItem['id'];
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
  SignDocument: NavigatorScreenParams<SignDocumentNavigatorParamList>;
  SignDocumentProviderListScreen: undefined;
  StatusCheckResult: {
    credentialIds: Array<CredentialListItem['id']>;
  };
  TrustEcosystems: TrustEcosystemsRouteParams;
  TrustInfo: {
    trustInformation: TrustInformationDetail;
  };
  VersionUpdate: undefined;
  WalletUnitError: undefined;
  WalletUnitRegistration: WalletUnitRegistrationParams;
};

export type RootRouteProp<RouteName extends keyof RootNavigatorParamList> =
  RouteProp<RootNavigatorParamList, RouteName>;
export type RootNavigationProp<
  RouteName extends keyof RootNavigatorParamList = 'Dashboard',
> = NativeStackNavigationProp<RootNavigatorParamList, RouteName>;
