/**
 * Ignore some yellowbox warnings. Some of these are for deprecated functions
 * that we haven't gotten around to replacing yet.
 */
import { LogBox } from 'react-native';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

LogBox.ignoreLogs(['Require cycle:']);

configureReanimatedLogger({
  // Only show errors, suppressing warnings
  level: ReanimatedLogLevel.error,
  strict: false,
});
