export interface EndpointsConfiguration {
  onboardingInvitation: string;
}

export interface BackendConfiguration {
  endpoints: EndpointsConfiguration;
  host: string;
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
  /** screen capture prevention enabled */
  screenCaptureBlocking: boolean;
  /** ubiquRse enabled */
  ubiquRse: boolean;
}

export interface Configuration {
  appName: string;
  backendConfig: BackendConfiguration;
  customOpenIdUrlScheme?: string;
  featureFlags: FeatureFlags;
  trustAnchorPublisherReference: string;
}

export type LocaleOverride = Record<string /* language */, unknown>;
