/* eslint-disable @typescript-eslint/naming-convention */

jest.mock('react-native-ultimate-config', () => ({
  CONFIG_NAME: 'procivis',
  ENVIRONMENT: 'test',
  APP_NAME: 'ONE+',
  APP_ID: 'ch.procivis.one.wallet.dev',
}));

export {};
