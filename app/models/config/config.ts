export interface EndpointsConfiguration {
  onboardingInvitation: string;
}

export interface BackendConfiguration {
  endpoints: EndpointsConfiguration;
  host: string;
}

/** features enabled/disabled per flavor */
export interface FeatureFlags {
  /** ISO mDL flows enabled */
  isoMdl: boolean;
  /** language selection enabled in settings */
  localization: boolean;
  /** screen capture prevention enabled */
  screenCaptureBlocking: boolean;
}

export interface Configuration {
  appName: string;
  backendConfig: BackendConfiguration;
  customOpenIdUrlScheme?: string;
  featureFlags: FeatureFlags;
  trustAnchorPublisherReference: string;
}

export type LocaleOverride = Record<string /* language */, unknown>;
