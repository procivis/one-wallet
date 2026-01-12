declare module 'react-native-ultimate-config' {
  type Flavor = {
    readonly CONFIG_NAME: 'procivis';
    readonly DETOX_BUILD: boolean | undefined;
    readonly ENVIRONMENT: 'dev' | 'test' | 'demo' | 'trial';
  };

  type Config = Flavor & {
    readonly APP_ID: string;
    readonly APP_NAME: string;
    readonly CUSTOM_OPENID_CREDENTIAL_OFFER_URL_SCHEME: string | undefined;
    readonly CUSTOM_OPENID_PROOF_REQUEST_URL_SCHEME: string | undefined;
    readonly SENTRY_DSN?: string;
    readonly TRUST_ANCHOR_PUBLISHER_REFERENCE?: string;
  };
  const config: Readonly<Config>;
  export default config;
}
