declare module 'react-native-ultimate-config' {
  type Flavor = {
    readonly CONFIG_NAME: 'procivis';
    readonly ENVIRONMENT: 'dev' | 'test' | 'demo' | 'trial';
  };

  type Config = Flavor & {
    readonly APP_ID: string;
    readonly APP_NAME: string;
  };
  const config: Readonly<Config>;
  export default config;
}
