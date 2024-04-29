// Date & Time formatted as specified in SW-610

export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
    minute: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
/**
 * Time only format
 */
export const formatTime = (date: Date, locale?: string) => {
  try {
    return date.toLocaleDateString(locale, {
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
    return date.toLocaleString(locale, {
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
