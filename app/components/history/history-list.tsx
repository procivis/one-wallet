import { useAppColorScheme } from '@procivis/one-react-native-components';
import { HistoryListQuery } from '@procivis/react-native-one-core';
import React, { FC, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  SectionList,
  SectionListProps,
  StyleSheet,
} from 'react-native';

import { useHistory } from '../../hooks/core/history';
import { HistoryListItemWithDid } from '../../models/core/history';
import {
  groupEntriesByDay,
  HistoryGroupByDaySection,
} from '../../utils/history';
import {
  HistorySectionHeader,
  HistorySectionItem,
  HistorySectionItemProps,
} from './history-section';

export interface HistorySectionListProps
  extends Omit<
    SectionListProps<HistoryListItemWithDid, HistoryGroupByDaySection>,
    'sections'
  > {
  getItemProps?: (
    item: HistoryListItemWithDid,
  ) => Partial<HistorySectionItemProps> | undefined;
  itemProps?: Partial<HistorySectionItemProps>;
  query: Partial<HistoryListQuery>;
}

export const HistorySectionList: FC<HistorySectionListProps> = ({
  query,
  contentContainerStyle,
  getItemProps,
  itemProps,
  ...props
}) => {
  const colorScheme = useAppColorScheme();
  const {
    data: historyData,
    fetchNextPage: fetchNextHistoryPage,
    hasNextPage: hasNextHistoryPage,
    isLoading,
  } = useHistory(query);

  const history = useMemo(() => {
    const items = historyData?.pages
      .flat()
      .map((page) => page.values)
      .flat();
    if (!items) {
      return undefined;
    }
    return groupEntriesByDay(items);
  }, [historyData?.pages]);

  const onEndReached = useCallback(() => {
    if (hasNextHistoryPage) {
      fetchNextHistoryPage();
    }
  }, [fetchNextHistoryPage, hasNextHistoryPage]);

  if (!history) {
    return <ActivityIndicator color={colorScheme.accent} />;
  }

  return (
    <SectionList<HistoryListItemWithDid, HistoryGroupByDaySection>
      ListFooterComponent={
        isLoading ? (
          <ActivityIndicator color={colorScheme.accent} style={styles.footer} />
        ) : undefined
      }
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      keyExtractor={(item) => item.id}
      onEndReached={onEndReached}
      renderItem={({ item, index, section }) => (
        <HistorySectionItem
          first={!index}
          item={item}
          last={index === section.data.length - 1}
          {...itemProps}
          {...getItemProps?.(item)}
        />
      )}
      renderSectionHeader={({ section }) => (
        <HistorySectionHeader section={section} />
      )}
      sections={history}
      stickySectionHeadersEnabled={false}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    marginVertical: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
