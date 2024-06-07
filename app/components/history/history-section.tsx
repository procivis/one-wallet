import {
  HistoryListItem,
  HistorySectionHeader as HistorySectionHeaderView,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import moment from 'moment';
import React, { FC, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { HistoryGroupByDaySection } from '../../utils/history';
import {
  getHistoryItemLabelAndIconForAction,
  HistoryItemProps,
} from './history-item';

// components used on the history section lists (Settings->History, CredentialDetail->History)
// https://www.figma.com/file/52qDYWUMjXAGre1dcnz5bz/Procivis-One-Wallet?type=design&node-id=1246-51813&mode=dev

export const HistorySectionHeader: FC<{
  section: HistoryGroupByDaySection;
  testID?: string;
}> = ({ section, testID }) => {
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
    <HistorySectionHeaderView
      day={day}
      testID={testID}
      year={section.firstYearEntry ? section.date.year().toString() : undefined}
    />
  );
};

export interface HistorySectionItemProps extends HistoryItemProps {
  first?: boolean;
}

export const HistorySectionItem: FC<HistorySectionItemProps> = ({
  first,
  item,
  last,
  onPress,
  style,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const { label, icon } = getHistoryItemLabelAndIconForAction(item);
  const time = moment(item.createdDate);
  const timeLabel = time.format('H:mm');

  const pressHandler = useCallback(() => {
    onPress?.(item);
  }, [onPress, item]);

  return (
    <View
      style={[
        styles.item,
        first && styles.first,
        last && styles.last,
        { backgroundColor: colorScheme.white },
      ]}
    >
      <HistoryListItem
        did={item.did ?? ''}
        icon={icon}
        label={label}
        onPress={pressHandler}
        style={style}
        testID={testID}
        time={timeLabel}
      />
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
  item: {
    paddingHorizontal: 12,
  },
  last: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
    paddingBottom: 12,
  },
});
