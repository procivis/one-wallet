import {
  NavigationHeader,
  NavigationHeaderProps,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React from 'react';
import {
  SectionList,
  SectionListProps,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useListContentInset } from '../../hooks/list/list-content-inset';
import { useOnScrollHeaderState } from '../../hooks/navigation/on-scroll-header-state';
import ListTitleHeader from '../list/list-title-header';

type SectionListScreenProps<ItemT, SectionT> = ViewProps & {
  header: Omit<
    NavigationHeaderProps,
    'animate' | 'blurred' | 'style' | 'title' | 'titleVisible'
  > & {
    static?: boolean;
    title: string;
  };
  list: Omit<
    SectionListProps<ItemT, SectionT>,
    'ListHeaderComponent' | 'onScroll'
  >;
};

const SectionListScreen = <ItemT, SectionT>({
  header,
  list: { contentContainerStyle, stickySectionHeadersEnabled, ...listProps },
  style,
  ...viewProps
}: SectionListScreenProps<ItemT, SectionT>) => {
  const colorScheme = useAppColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  const contentInsetsStyle = useListContentInset();
  const { titleVisible, onScroll } = useOnScrollHeaderState();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme.background },
        style,
      ]}
      {...viewProps}
    >
      <SectionList<ItemT, SectionT>
        ListHeaderComponent={
          !header.static ? <ListTitleHeader title={header.title} /> : undefined
        }
        contentContainerStyle={[contentInsetsStyle, contentContainerStyle]}
        onScroll={onScroll}
        scrollEventThrottle={100}
        stickySectionHeadersEnabled={stickySectionHeadersEnabled ?? false}
        {...listProps}
      />
      <NavigationHeader
        animate
        blurred
        style={[styles.header, { paddingTop: safeAreaInsets.top }]}
        titleVisible={header.static || titleVisible}
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
