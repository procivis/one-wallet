// we always make sure 'react-native' gets included first
import 'react-native';
// libraries to mock
import './mock-react-native-image';
import './mock-async-storage';
import './mock-i18n';
import './mock-react-native-ultimate-config';
import './mock-rnfs';
import './mock-sentry';

jest.useFakeTimers();
declare global {
  let __TEST__: boolean;
}
