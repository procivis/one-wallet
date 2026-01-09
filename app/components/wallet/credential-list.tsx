import {
  concatTestID,
  useAppColorScheme,
  useCredentialListExpandedCard,
  useListContentInset,
  WalletEmptySearchResult,
} from '@procivis/one-react-native-components';
import { CredentialListItemBindingDto } from '@procivis/react-native-one-core';
import React, { FC, useCallback } from 'react';
import { Animated, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import ListPageLoadingIndicator from '../list/list-page-loading-indicator';
import WalletCredentialListItem from './credential-list-item';

type WalletCredentialListProps = {
  credentials: CredentialListItemBindingDto[];
  hasNextPage: boolean;
  onCredentialPress: (credentialId: string) => void;
  onEndReached: () => void;
  scrollOffset: Animated.Value;
  testID: string;
  withNotice?: boolean;
};

const WalletCredentialList: FC<WalletCredentialListProps> = ({
  credentials,
  onEndReached,
  onCredentialPress,
  scrollOffset,
  testID,
  hasNextPage,
  withNotice,
}) => {
  const colorScheme = useAppColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  const contentInsetsStyle = useListContentInset({
    headerHeight: 120 + 8 - (withNotice ? safeAreaInsets.top - 15 : 0),
  });
  const {
    locale: { locale },
  } = useStores();
  const { expandedCredential, onHeaderPress, foldCards } =
    useCredentialListExpandedCard();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<CredentialListItemBindingDto>) => {
      return (
        <WalletCredentialListItem
          expandedCredentialId={expandedCredential}
          handleCredentialPress={onCredentialPress}
          index={index}
          item={item}
          lastItem={Boolean(credentials && index === credentials.length - 1)}
          onFoldCards={foldCards}
          onHeaderPress={onHeaderPress}
        />
      );
    },
    [
      credentials,
      expandedCredential,
      foldCards,
      onCredentialPress,
      onHeaderPress,
    ],
  );

  return (
    <Animated.FlatList<CredentialListItemBindingDto>
      ListEmptyComponent={
        <WalletEmptySearchResult
          subtitle={translate(
            'info.wallet.credentialsList.empty.search.subtitle',
          )}
          title={translate('common.noCredentialsFound')}
        />
      }
      ListFooterComponent={
        credentials && credentials.length > 0 ? (
          <View style={styles.footer}>
            {hasNextPage && (
              <ListPageLoadingIndicator
                color={colorScheme.accent}
                style={styles.pageLoadingIndicator}
              />
            )}
          </View>
        ) : undefined
      }
      contentContainerStyle={contentInsetsStyle}
      data={credentials}
      extraData={expandedCredential}
      key={locale}
      keyExtractor={(item) => item.id}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
        {
          useNativeDriver: false,
        },
      )}
      onScrollBeginDrag={foldCards}
      renderItem={renderItem}
      scrollEnabled={credentials && credentials.length > 0}
      showsVerticalScrollIndicator={false}
      style={[styles.list, { backgroundColor: colorScheme.background }]}
      testID={concatTestID(testID, 'scroll')}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    minHeight: 20,
  },
  list: {
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 16,
    overflow: 'visible',
    paddingHorizontal: 0,
  },
  pageLoadingIndicator: {
    marginBottom: 20,
    marginTop: 12,
  },
});

export default WalletCredentialList;
