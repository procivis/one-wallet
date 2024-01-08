import { Platform } from 'react-native';

import { convertDateStrToLocalDate, convertDateToUTCTimestamp } from './date';

const TIMES = [
  [
    '2000-01-02', // without daylight-saving
    {
      day: 2,
      month: 0,
      utcTimestamp: 946771200000, // 2000-01-02T00:00:00.000Z
      year: 2000,
    },
  ],
  [
    '2022-08-24', // with daylight-saving
    {
      day: 24,
      month: 7,
      utcTimestamp: 1661299200000, // 2022-08-24T00:00:00.000Z
      year: 2022,
    },
  ],
] as const;

describe('convertDateToUTCTimestamp', () => {
  test.each(TIMES)(
    'converts local date to UTC timestamp %p',
    (_, { utcTimestamp, month, day, year }) => {
      const date = new Date();
      date.setMonth(month);
      date.setDate(day);
      date.setFullYear(year);
      expect(convertDateToUTCTimestamp(date)).toBe(utcTimestamp);
    },
  );
});

describe.each(['android', 'ios'] as const)(
  'convertDateStrToLocalDate %p',
  (platform) => {
    beforeEach(() => {
      Platform.OS = platform;
      Platform.select = (selection: any) =>
        selection[platform] ?? selection.default;
    });

    test.each(TIMES)(
      'converts to local date  %p',
      (dateStr, { utcTimestamp }) => {
        const date = convertDateStrToLocalDate(dateStr);
        const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
        expect(date.getTime()).toBe(utcTimestamp + timezoneOffset);
      },
    );
  },
);
