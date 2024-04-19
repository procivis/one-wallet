import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import moment from 'moment';
import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { HistoryGroupByDaySection } from '../../utils/history';
import { HistoryItem, HistoryItemProps } from './history-item';

// components used on the history section lists (Settings->History, CredentialDetail->History)
// https://www.figma.com/file/52qDYWUMjXAGre1dcnz5bz/Procivis-One-Wallet?type=design&node-id=1246-51813&mode=dev

export const HistorySectionHeader: FC<{
  section: HistoryGroupByDaySection;
}> = ({ section }) => {
  const colorScheme = useAppColorScheme();

  const day = useMemo(() => {
    const now = moment();
    const date = moment(section.date);

    if (date.isSame(now, 'day')) {
      return translate('common.today');
    } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return translate('common.yesterday');
    }
    return date.format('Do MMMM');
  }, [section.date]);

  return (
    <View style={styles.header}>
      <Typography
        accessibilityRole="header"
        color={colorScheme.text}
        preset="m"
      >
        {day}
      </Typography>
      {section.firstYearEntry && (
        <Typography
          color={colorScheme.accent}
          preset="s/line-height-small"
          style={styles.year}
        >
          {section.date.year()}
        </Typography>
      )}
    </View>
  );
};

export interface HistorySectionItemProps extends HistoryItemProps {
  first?: boolean;
}

export const HistorySectionItem: FC<HistorySectionItemProps> = ({
  first,
  last,
  ...props
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[
        styles.item,
        first && styles.first,
        last && styles.last,
        { backgroundColor: colorScheme.white },
      ]}
    >
      <HistoryItem absoluteTime={true} last={last} {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  first: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 8,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  item: {
    paddingHorizontal: 12,
  },
  last: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
    paddingBottom: 12,
  },
  year: {
    opacity: 0.7,
  },
});
