// eslint-disable-next-line no-restricted-imports
import * as ReactNative from 'react-native';

jest.doMock('react-native-vision-camera', () => {
  return {
    Camera: ReactNative.View,
    useCameraDevice: () => null,
    useCameraPermission: () => null,
    useCodeScanner: () => null,
  };
});
