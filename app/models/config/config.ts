export interface EndpointsConfiguration {
  onboardingInvitation: string;
}

export interface BackendConfiguration {
  endpoints: EndpointsConfiguration;
  host: string;
}

export interface FeatureFlags {
  isoMdl: boolean;
  localization: boolean;
}

export interface Configuration {
  appName: string;
  backendConfig: BackendConfiguration;
  featureFlags: FeatureFlags;
}

export type LocaleOverride = Record<string /* language */, unknown>;
