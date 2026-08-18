jest.mock(
  'react-native-worklets',
  () => jest.requireActual('react-native-worklets/src/mock') as unknown,
);

jest.mock(
  'react-native-reanimated',
  () => jest.requireActual('react-native-reanimated/mock') as unknown
);