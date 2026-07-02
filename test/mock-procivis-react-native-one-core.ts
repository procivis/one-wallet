import { ONE_CORE_MOCK } from './utils/core-mock';

jest.doMock('@procivis/react-native-one-core', () => {
  const lib: Record<string, unknown> = jest.requireActual(
    '@procivis/react-native-one-core',
  );

  const ubiqu = lib.Ubiqu as Record<string, unknown>;
  for (const item of Object.keys(ubiqu)) {
    if (typeof ubiqu[item] === 'function' && item !== 'PinPad') {
      if (item === 'addEventListener') {
        ubiqu[item] = jest.fn(() => () => {});
      } else {
        ubiqu[item] = jest.fn(() =>
          Promise.reject(new Error(`Ubiqu.${item} called`)),
        );
      }
    }
  }

  lib.initializeCore = jest.fn(() => Promise.resolve(ONE_CORE_MOCK));

  return lib;
});
