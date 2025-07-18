import { formatTimestamp as formatTimestampCommon } from '@procivis/one-react-native-components';

import { translate } from '../i18n';
import i18n from '../i18n/i18n';

/**
 * Timestamp formatted for general use
 */
export const formatTimestamp = (
  date: Date,
  locale: string = i18n.locale,
): string => {
  return formatTimestampCommon(date, locale, translate('common.now'));
};
