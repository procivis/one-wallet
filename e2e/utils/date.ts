// Date & Time formatted as specified in SW-610

// Default tests locale
const defaultLocale = 'en-US';

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
    return date
      .toLocaleDateString(locale || defaultLocale, {
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(' AM', ' AM')
      .replace(' PM', ' PM');
  } catch {
    return undefined;
  }
};

/**
 * Date and time format
 */
export const formatDateTime = (date: Date, locale?: string) => {
  try {
    return date
      .toLocaleString(locale || defaultLocale, {
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        month: 'numeric',
        year: 'numeric',
      })
      .replace(' AM', ' AM')
      .replace(' PM', ' PM');
  } catch {
    return undefined;
  }
};
