/* eslint-disable @typescript-eslint/naming-convention */
declare module 'react-native-ultimate-config' {
  type Flavor = { readonly CONFIG_NAME: 'procivis'; readonly ENVIRONMENT: 'dev' | 'test' | 'demo' };

  type Config = Flavor & {
    readonly APP_NAME: string;
    readonly APP_ID: string;
  };
  const config: Readonly<Config>;
  export default config;
}
