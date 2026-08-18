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
import './mock-react-native-nfc-manager';
import './mock-react-native-share';
import './mock-reanimated';
import './mock-react-native-reanimated-carousel';
import './mock-react-native-svg';
import './mock-procivis-react-native-one-core';
import './mock-react-native-vision-camera';

jest.useFakeTimers();

/* eslint-disable @typescript-eslint/no-unsafe-argument */
// change date/time display to always use UTC timezone and stable formatting
const pad = (x: number) => (x >= 0 && x < 10 ? `0${x}` : String(x));
const utcDate = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
const utcTime = (date: Date) =>
  `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
    date.getUTCSeconds(),
  )}`;
jest
  .spyOn(Date.prototype, 'toLocaleDateString')
  .mockImplementation(function () {
    // @ts-ignore
    return utcDate(this);
  });
jest
  .spyOn(Date.prototype, 'toLocaleTimeString')
  .mockImplementation(function () {
    // @ts-ignore
    return utcTime(this);
  });
jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(function () {
  // @ts-ignore
  return `${utcDate(this)} ${utcTime(this)}`;
});

declare global {
  let __TEST__: boolean;
}
