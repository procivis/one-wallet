/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');

  rn.NativeModules.I18nManager.localeIdentifier = 'en_US';

  return Object.defineProperty(rn, 'Settings', {
    get: jest.fn(() => {
      return {
        get: jest.fn(() => 'en_US'),
      };
    }),
  });

  return rn;
});
