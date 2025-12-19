// we always make sure 'react-native' gets included first
import 'react-native';
// libraries to mock
import './mock-react-native-modules';
import './mock-react-native-image';
import './mock-async-storage';
import './mock-i18n';
import './mock-react-native-ultimate-config';
import './mock-rnfs';
import './mock-sentry';
import './mock-localize';
import './mock-camera';
import './mock-react-native-community-netinfo';
import './mock-react-native-bluetooth-state-manager';
import './mock-reanimated';
import './mock-procivis-react-native-one-core';

import { setUpTests as reanimatedSetupTests } from 'react-native-reanimated';

reanimatedSetupTests();

jest.useFakeTimers();
declare global {
  let __TEST__: boolean;
}
