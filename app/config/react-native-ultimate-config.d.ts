/* eslint-disable @typescript-eslint/naming-convention */
declare module "react-native-ultimate-config" {
  interface Config {
    readonly CONFIG_NAME: "procivis";
    readonly DEV_CONFIG: "true" | "false";
    readonly APP_NAME: string;
    readonly APP_ID: string;
  }
  const config: Readonly<Config>;
  export default config;
}
