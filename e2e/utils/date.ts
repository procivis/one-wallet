// Date & Time formatted as specified in SW-610

import { device } from 'detox';

// Default tests locale
const defaultLocale = device.getPlatform() === 'ios' ? 'en-US' : undefined;

/**
 * Date only format
 */
export const formatDate = (
  date: Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  try {
    return date.toLocaleDateString(locale || defaultLocale, options);
  } catch {
    return undefined;
  }
};

/**
 * Time only format
 */
export const formatTime = (date: Date, locale?: string) => {
  try {
    return date.toLocaleDateString(locale || defaultLocale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return undefined;
  }
};

/**
 * Date and time format
 */
export const formatDateTime = (date: Date, locale?: string) => {
  try {
    return date.toLocaleString(locale || defaultLocale, {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'numeric',
      year: 'numeric',
    });
  } catch {
    return undefined;
  }
};
