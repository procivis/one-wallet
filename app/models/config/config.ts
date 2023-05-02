export interface EndpointsConfiguration {
  onboardingInvitation: string;
}

export interface BackendConfiguration {
  host: string;
  endpoints: EndpointsConfiguration;
}

export interface FeatureFlags {}

export interface Configuration {
  appName: string;
  backendConfig: BackendConfiguration;
  featureFlags: FeatureFlags;
}

export type LocaleOverride = Record<string /* language */, unknown>;
