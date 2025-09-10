import { WalletProviderTypeEnum } from '@procivis/react-native-one-core';

export interface EndpointsConfiguration {
  onboardingInvitation: string;
}

export interface BackendConfiguration {
  endpoints: EndpointsConfiguration;
  host: string;
}

export interface WalletProviderConfiguration {
  appIntegrityCheckRequired: boolean;
  enabled: boolean;
  name: string;
  required: boolean;
  type: WalletProviderTypeEnum;
  url: string;
}

/** features enabled/disabled per flavor */
export interface FeatureFlags {
  /** BLE enabled */
  bleEnabled: boolean;
  /** HTTP transport enabled */
  httpTransportEnabled: boolean;
  /** ISO mDL flows enabled */
  isoMdl: boolean;
  /** language selection enabled in settings */
  localization: boolean;
  /** MQTT transport enabled */
  mqttTransportEnabled: boolean;
  /** create request credential enabled */
  requestCredentialEnabled: boolean;
  /** ubiquRse enabled */
  ubiquRse: boolean;
}

export interface Configuration {
  appName: string;
  backendConfig: BackendConfiguration;
  customOpenIdUrlScheme?: string;
  featureFlags: FeatureFlags;
  requestCredentialRedirectUri?: string;
  trustAnchorPublisherReference: string;
  walletProvider: WalletProviderConfiguration;
}

export type LocaleOverride = Record<string /* language */, unknown>;
