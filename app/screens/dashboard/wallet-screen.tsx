import {
  ActivityIndicator,
  Button,
  concatTestID,
  CredentialDetailsCardListItem,
  FoldableHeader,
  getCredentialCardPropsFromCredential,
  Header,
  NextIcon,
  NoCredentialsIcon,
  ScanButton,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useCoreConfig,
  useCredentialDetail,
  useCredentialListExpandedCard,
  useListContentInset,
  usePagedCredentials,
} from '@procivis/one-react-native-components';
import {
  CredentialListIncludeEntityType,
  CredentialListItem,
  CredentialListQuery,
  CredentialStateEnum,
  SortableCredentialColumnEnum,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Animated,
  SectionListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ListPageLoadingIndicator from '../../components/list/list-page-loading-indicator';
import { HeaderOptionsButton } from '../../components/navigation/header-buttons';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';

const WalletScreen: FunctionComponent = observer(() => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const { data: config } = useCoreConfig();
  const safeAreaInsets = useSafeAreaInsets();
  const contentInsetsStyle = useListContentInset({
    headerHeight: 120 + 8,
  });

  const [scrollOffset] = useState(() => new Animated.Value(0));

  const {
    locale: { locale },
  } = useStores();
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Partial<CredentialListQuery>>({
    include: [CredentialListIncludeEntityType.LAYOUT_PROPERTIES],
    sort: SortableCredentialColumnEnum.SCHEMA_NAME,
    status: [
      CredentialStateEnum.ACCEPTED,
      CredentialStateEnum.SUSPENDED,
      CredentialStateEnum.REVOKED,
    ],
  });
  const {
    data: credentialsData,
    fetchNextPage,
    hasNextPage,
  } = usePagedCredentials(queryParams);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const { expandedCredential, onHeaderPress, foldCards } =
    useCredentialListExpandedCard();

  useCredentialStatusCheck();

  const credentials = useMemo(
    () => credentialsData?.pages.map((page) => page.values).flat(),
    [credentialsData?.pages],
  );

  const handleEndReached = useCallback(() => {
    const pageParam = credentialsData?.pages.length;
    if (!pageParam) {
      return;
    }
    fetchNextPage({ pageParam });
  }, [fetchNextPage, credentialsData?.pages.length]);

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleSearchPhraseChange = useMemo(
    () => debounce(setQueryParams, 500),
    [],
  );
  useEffect(() => {
    //@ts-ignore - typing issue related to searchText / searchType.
    handleSearchPhraseChange((prev) => ({
      ...prev,
      name: searchPhrase || undefined,
    }));
  }, [handleSearchPhraseChange, searchPhrase]);

  const handleCredentialPress = useCallback(
    (credentialId: string) => {
      if (credentialId) {
        navigation.navigate('CredentialDetail', {
          params: { credentialId },
          screen: 'Detail',
        });
      }
    },
    [navigation],
  );

  const handleScanPress = useCallback(() => {
    navigation.navigate('Dashboard', { screen: 'QRCodeScanner' });
  }, [navigation]);

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: SectionListRenderItemInfo<CredentialListItem>) => {
      // TODO Fix / discuss. This is ineficient.
      // The list item contains no claims. Without claims we can not render
      // all preview fields (primaryAttribute, photoAttribute, MRZ, etc.)
      const { data: credential } = useCredentialDetail(item.id, isFocused);

      if (!credential || !config) {
        return null;
      }

      const testID = concatTestID('WalletScreen.credential', credential.id);
      const { header, ...cardProps } = getCredentialCardPropsFromCredential(
        credential,
        credential.claims,
        config,
        undefined,
        concatTestID(testID, 'card'),
        credentialCardLabels(),
      );
      const headerAccessory = (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleCredentialPress(credential.id)}
          style={styles.headerAccessory}
          testID={concatTestID(testID, 'card.header.openDetail')}
        >
          <NextIcon color={colorScheme.text} />
        </TouchableOpacity>
      );
      const lastItem = index === section.data.length - 1;
      const expanded = lastItem || expandedCredential === credential.id;
      return (
        <CredentialDetailsCardListItem
          attributes={[]}
          card={{
            ...cardProps,
            credentialId: credential.id,
            header: {
              ...header,
              accessory: headerAccessory,
            },
            onCardPress: expanded ? foldCards : undefined,
            onHeaderPress: lastItem ? foldCards : onHeaderPress,
          }}
          detailsCardStyle={styles.listItemExpanded}
          expanded={expanded}
          key={`${index}-${lastItem ? 'last' : ''}`}
          lastItem={lastItem}
          style={styles.listItem}
          testID={testID}
        />
      );
    },
    [
      config,
      colorScheme.text,
      expandedCredential,
      foldCards,
      handleCredentialPress,
      onHeaderPress,
      isFocused,
    ],
  );

  useEffect(() => {
    setIsEmpty((!credentials || credentials.length === 0) && !searchPhrase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials]);

  const optionsButton = useMemo(
    () => (
      <HeaderOptionsButton
        accessibilityLabel="wallet.settings"
        onPress={handleWalletSettingsClick}
        testID="WalletScreen.header.action-settings"
      />
    ),
    [handleWalletSettingsClick],
  );

  return (
    <View
      style={[styles.background, { backgroundColor: colorScheme.background }]}
      testID="WalletScreen"
    >
      {!credentials && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator animate={isFocused} />
        </View>
      )}
      {credentials && isEmpty && (
        <View style={styles.empty}>
          <Typography
            align="center"
            color={colorScheme.text}
            preset="l/line-height-large"
            style={styles.emptyTitle}
            testID="WalletScreen.empty.title"
          >
            {translate('wallet.credentialsList.empty.title')}
          </Typography>
          <Typography
            align="center"
            color={colorScheme.text}
            style={styles.emptySubtitle}
            testID="WalletScreen.empty.subtitle"
          >
            {translate('wallet.credentialsList.empty.subtitle')}
          </Typography>
          <NoCredentialsIcon style={styles.emptyIcon} />
          <Button
            onPress={handleScanPress}
            style={[
              styles.emptyButton,
              { bottom: Math.max(24, safeAreaInsets.bottom) },
            ]}
            testID="WalletScreen.scanQrCode"
            title={translate('wallet.credentialsList.empty.scanQrCode')}
          />
        </View>
      )}
      {credentials && !isEmpty && (
        <Animated.SectionList
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Typography
                align="center"
                color={colorScheme.text}
                preset="l/line-height-large"
                style={styles.emptyTitle}
              >
                {translate('wallet.credentialsList.empty.search.title')}
              </Typography>
              <Typography align="center" color={colorScheme.text}>
                {translate('wallet.credentialsList.empty.search.subtitle')}
              </Typography>
            </View>
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
          extraData={expandedCredential}
          key={locale}
          keyExtractor={(item) => item.id}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
            {
              useNativeDriver: true,
            },
          )}
          onScrollBeginDrag={foldCards}
          renderItem={renderItem}
          scrollEnabled={credentials && credentials.length > 0}
          sections={
            credentials && credentials.length > 0 ? [{ data: credentials }] : []
          }
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          style={[styles.list, { backgroundColor: colorScheme.background }]}
          testID="WalletScreen.scroll"
        />
      )}
      {!isEmpty && <ScanButton onPress={handleScanPress} />}
      <FoldableHeader
        header={
          <Header
            rightButton={optionsButton}
            testID={'WalletScreen.header'}
            title={translate('wallet.title')}
            titleRowStyle={!isEmpty && styles.headerWithSearchBar}
          />
        }
        scrollOffset={scrollOffset}
        searchBar={
          isEmpty
            ? undefined
            : {
                rightButton: optionsButton,
                searchBarProps: {
                  onSearchPhraseChange: setSearchPhrase,
                  placeholder: translate('wallet.search'),
                  searchPhrase,
                  testID: 'WalletScreen.header.search',
                },
              }
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
    marginTop: 224,
  },
  emptyButton: {
    marginBottom: 16,
    position: 'absolute',
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyIcon: {
    marginTop: -30,
  },
  emptySearch: {
    alignItems: 'center',
    flex: 1,
    marginTop: 224,
  },
  emptySubtitle: {
    opacity: 0.7,
  },
  emptyTitle: {
    marginBottom: 8,
    opacity: 0.7,
  },
  footer: {
    minHeight: 20,
  },
  headerAccessory: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerWithSearchBar: {
    marginTop: 0,
    paddingBottom: 18,
  },
  list: {
    flex: 1,
    marginHorizontal: 16,
    overflow: 'visible',
    paddingHorizontal: 0,
  },
  listItem: {
    marginBottom: 8,
  },
  listItemExpanded: {
    marginBottom: 32,
  },
  loadingIndicator: {
    height: '100%',
  },
  pageLoadingIndicator: {
    marginBottom: 20,
    marginTop: 12,
  },
});

export default WalletScreen;
