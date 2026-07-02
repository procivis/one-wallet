import { setUpTests as reanimatedSetupTests } from 'react-native-reanimated';

jest.mock(
  'react-native-worklets',
  () => jest.requireActual('react-native-worklets/src/mock') as unknown,
);

reanimatedSetupTests();
