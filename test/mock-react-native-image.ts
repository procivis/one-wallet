/* eslint-disable @typescript-eslint/no-unsafe-return */

// eslint-disable-next-line no-restricted-imports
import * as ReactNative from 'react-native';

import mockFile from './mock-file';

jest.doMock('react-native', () => {
  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      Image: {
        ...ReactNative.Image,
        getSize: jest.fn(
          (
            uri: string,
            success: (width: number, height: number) => void,
            _failure?: (error: unknown) => void,
          ) => success(100, 100),
        ),
        resolveAssetSource: jest.fn((_source) => mockFile),
      },
      StyleSheet: ReactNative.StyleSheet,
    },
    ReactNative,
  );
});
