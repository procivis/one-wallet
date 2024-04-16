import {
  NavigationHeader,
  NavigationHeaderProps,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React from 'react';
import { SectionList, SectionListProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useListContentInset } from '../../hooks/list/list-content-inset';
import { useOnScrollHeaderState } from '../../hooks/navigation/on-scroll-header-state';
import ListTitleHeader from '../list/list-title-header';

type SectionListScreenProps<ItemT, SectionT> = {
  header: Omit<
    NavigationHeaderProps,
    'animate' | 'blurred' | 'style' | 'title' | 'titleVisible'
  > & {
    title: string;
  };
  list: Omit<
    SectionListProps<ItemT, SectionT>,
    'ListHeaderComponent' | 'contentContainerStyle' | 'onScroll'
  >;
};

const SectionListScreen = <ItemT, SectionT>({
  header,
  list: { stickySectionHeadersEnabled, ...listProps },
}: SectionListScreenProps<ItemT, SectionT>) => {
  const colorScheme = useAppColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  const contentInsetsStyle = useListContentInset();
  const { titleVisible, onScroll } = useOnScrollHeaderState();

  return (
    <View
      style={[styles.container, { backgroundColor: colorScheme.background }]}
    >
      <SectionList<ItemT, SectionT>
        ListHeaderComponent={<ListTitleHeader title={header.title} />}
        contentContainerStyle={contentInsetsStyle}
        onScroll={onScroll}
        stickySectionHeadersEnabled={stickySectionHeadersEnabled ?? false}
        {...listProps}
      />
      <NavigationHeader
        animate
        blurred
        style={[styles.header, { paddingTop: safeAreaInsets.top }]}
        titleVisible={titleVisible}
        {...header}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    width: '100%',
  },
});

export default SectionListScreen;
