import {
  ActivityIndicator,
  concatTestID,
  useAppColorScheme,
  useHistory,
} from '@procivis/one-react-native-components';
import { HistoryListQuery } from '@procivis/react-native-one-core';
import { useIsFocused } from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { Animated, SectionListProps, StyleSheet } from 'react-native';

import { HistoryListItemWithDid } from '../../models/core/history';
import {
  groupEntriesByDay,
  HistoryGroupByDaySection,
} from '../../utils/history';
import ListPageLoadingIndicator from '../list/list-page-loading-indicator';
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
  // optional customization of item props
  getItemProps?: (
    item: HistoryListItemWithDid,
  ) => Partial<HistorySectionItemProps> | undefined;
  itemProps?: Partial<HistorySectionItemProps>;

  // callback when empty list displayed
  onEmpty?: (empty: boolean) => void;
  query: Partial<HistoryListQuery>;
}

export const HistorySectionList: FC<HistorySectionListProps> = ({
  query,
  contentContainerStyle,
  getItemProps,
  itemProps,
  onEmpty,
  onScroll,
  ...props
}) => {
  const isFocused = useIsFocused();
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
    if (historyData) {
      setImmediate(() => onEmpty?.(!items.length));
    }
    return groupEntriesByDay(items);
  }, [historyData, onEmpty]);

  const onEndReached = useCallback(() => {
    if (hasNextHistoryPage) {
      fetchNextHistoryPage();
    }
  }, [fetchNextHistoryPage, hasNextHistoryPage]);

  if (!history) {
    return <ActivityIndicator animate={isFocused} />;
  }

  return (
    <Animated.SectionList<HistoryListItemWithDid, HistoryGroupByDaySection>
      ListFooterComponent={
        isLoading ? (
          <ListPageLoadingIndicator
            color={colorScheme.accent}
            style={styles.footer}
          />
        ) : undefined
      }
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      keyExtractor={(item) => item.id}
      onEndReached={onEndReached}
      onScroll={onScroll}
      renderItem={({ item, index, section }) => (
        <HistorySectionItem
          first={!index}
          item={item}
          last={index === section.data.length - 1}
          testID={concatTestID(props.testID, 'item', index.toString())}
          {...itemProps}
          {...getItemProps?.(item)}
        />
      )}
      renderSectionHeader={({ section }) => (
        <HistorySectionHeader
          section={section}
          testID={concatTestID(props.testID, 'section')}
        />
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
