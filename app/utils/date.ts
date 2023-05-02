import { formatDate, formatDateTime } from '@procivis/react-native-components';
import I18n from 'i18n-js';
import { Platform } from 'react-native';
import { format } from 'timeago.js';

import { translate } from '../i18n';

/**
 * Time-ago format
 */
export const formatTimeAgo = (date: Date, locale: string = I18n.locale) => {
  return format(date, locale);
};

/**
 * Timestamp formatted for general use
 */
export const formatTimestamp = (date: Date, locale?: string) => {
  const now = Date.now();
  const timestamp = date.getTime();
  if (now < timestamp) {
    // in the future
    return formatDateTime(date, locale);
  }

  // in the past
  if (now - timestamp < 60 * 1000) {
    // less than a minute ago
    return translate('common.time.now');
  }

  // less than a day ago
  if (now - timestamp < 24 * 60 * 60 * 1000) {
    return formatTimeAgo(date, locale);
  }

  // longer ago
  return formatDateTime(date, locale);
};

const pad = (x: number) => (x >= 0 && x < 10 ? `0${x}` : String(x));

/**
 * Utility function to deal with `date`-type attributes
 * @param {Date} date local timezone representation
 * @returns {number} the same day, but UTC timezone with midnight time
 */
export const convertDateToUTCTimestamp = (date: Date) =>
  Date.parse(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);

/**
 * Utility function to deal with `date`-type attributes
 * @param {string} date in YYYY-MM-DD representation
 * @returns {Date} the same day, but local timezone with midnight time
 */
export const convertDateStrToLocalDate = (date: string) =>
  Platform.select({
    default: new Date(`${date}T00:00:00`),
    // android conversion using the standard date parsing doesn't work, computing the timestamp manually
    android: (() => {
      const timestamp = Date.parse(date);
      const timezoneOffset = new Date(date).getTimezoneOffset();
      return new Date(timestamp + timezoneOffset * 60 * 1000);
    })(),
  });

/**
 * Inverted function to {@link convertDateToUTCTimestamp}
 * @param {number} utcTimestamp date timestamp represented as midnight UTC time
 * @returns {string} formatted date (based on locale settings, e.g. `21/02/2021`)
 */
export const formatDateOnlyFromUTCTimestamp = (utcTimestamp: number) => {
  const utcDate = new Date(utcTimestamp);
  return (
    formatDate(
      convertDateStrToLocalDate(
        `${utcDate.getUTCFullYear()}-${pad(utcDate.getUTCMonth() + 1)}-${pad(utcDate.getUTCDate())}`,
      ),
    ) ?? ''
  );
};
