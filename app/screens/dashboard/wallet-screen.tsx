import {
  Button,
  CredentialDetailsCardListItem,
  Header,
  OptionsIcon,
  ScanButton,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  ActivityIndicator,
  concatTestID,
  TouchableOpacity,
} from '@procivis/react-native-components';
import {
  CredentialListIncludeEntityType,
  CredentialListItem,
  CredentialListQuery,
  CredentialStateEnum,
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
  ActivityIndicator as LoadingIndicator,
  Animated,
  SectionListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NextIcon } from '../../components/icon/common-icon';
import { NoCredentialsIcon } from '../../components/icon/wallet-icon';
import { useCoreConfig } from '../../hooks/core/core-config';
import {
  useCredentialDetail,
  usePagedCredentials,
} from '../../hooks/core/credentials';
import { useCredentialListExpandedCard } from '../../hooks/credential-card/credential-card-expanding';
import { useListContentInset } from '../../hooks/list/list-content-inset';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { getCredentialCardPropsFromCredential } from '../../utils/credential';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const { data: config } = useCoreConfig();

  const safeAreaInsets = useSafeAreaInsets();
  const contentInsetsStyle = useListContentInset({ headerHeight: 0 });
  const {
    locale: { locale },
  } = useStores();
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Partial<CredentialListQuery>>({
    include: [CredentialListIncludeEntityType.LAYOUT_PROPERTIES],
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
      const isFocused = useIsFocused();
      const { data: credential } = useCredentialDetail(item.id, isFocused);

      if (!credential) {
        return null;
      }

      const testID = concatTestID('WalletScreen.credential', credential.id);
      const { header, ...cardProps } = getCredentialCardPropsFromCredential(
        credential,
        credential.claims,
        config,
        undefined,
        testID,
      );
      const headerAccessory = (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleCredentialPress(credential.id)}
          style={styles.headerAccessory}
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
          lastItem={lastItem}
          style={styles.listItem}
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
    ],
  );

  useEffect(() => {
    setIsEmpty((!credentials || credentials.length === 0) && !searchPhrase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials]);

  return (
    <View
      style={[styles.background, { backgroundColor: colorScheme.background }]}
      testID="WalletScreen"
    >
      <Header
        onSearchPhraseChange={!isEmpty ? setSearchPhrase : undefined}
        rightButton={
          <TouchableOpacity
            accessibilityLabel={translate('wallet.settings')}
            onPress={handleWalletSettingsClick}
            style={styles.settingsButton}
            testID="WalletScreen.header.action-settings"
          >
            <OptionsIcon color={colorScheme.text} />
          </TouchableOpacity>
        }
        searchPhrase={searchPhrase}
        style={[
          styles.header,
          {
            backgroundColor: colorScheme.background,
            paddingTop: safeAreaInsets.top,
          },
        ]}
        testID={'WalletScreen.header'}
        text={{
          searchPlaceholder: translate('wallet.search'),
        }}
        title={translate('wallet.title')}
      />
      <Animated.SectionList
        ListEmptyComponent={
          credentials ? (
            <View style={styles.empty} testID="WalletScreen.credentialList">
              {isEmpty ? (
                <>
                  <Typography
                    align="center"
                    color={colorScheme.text}
                    preset="l/line-height-large"
                    style={styles.emptyTitle}
                  >
                    {translate('wallet.credentialsList.empty.title')}
                  </Typography>
                  <Typography align="center" color={colorScheme.text}>
                    {translate('wallet.credentialsList.empty.subtitle')}
                  </Typography>
                  <NoCredentialsIcon style={styles.emptyIcon} />
                  <Button
                    onPress={handleScanPress}
                    style={[
                      styles.emptyButton,
                      { bottom: Math.max(24, safeAreaInsets.bottom) },
                    ]}
                    testID="OnboardingSetupScreen.setup"
                    title={translate('wallet.credentialsList.empty.scanQrCode')}
                  />
                </>
              ) : (
                <>
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
                </>
              )}
            </View>
          ) : (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator />
            </View>
          )
        }
        ListFooterComponent={
          credentials && credentials.length > 0 ? (
            <View style={styles.footer}>
              {hasNextPage && (
                <LoadingIndicator
                  color={colorScheme.accent}
                  style={styles.pageLoadingIndicator}
                />
              )}
            </View>
          ) : undefined
        }
        contentContainerStyle={
          isEmpty ? styles.emptyContainer : contentInsetsStyle
        }
        key={locale}
        keyExtractor={(item) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        onScrollBeginDrag={foldCards}
        renderItem={renderItem}
        sections={
          credentials && credentials.length > 0 ? [{ data: credentials }] : []
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        style={[styles.list, { backgroundColor: colorScheme.background }]}
      />
      {!isEmpty && <ScanButton onPress={handleScanPress} />}
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
    marginTop: 84,
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
    marginTop: -24,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  footer: {
    minHeight: 20,
  },
  header: {
    alignSelf: 'center',
    marginHorizontal: 16,
  },
  headerAccessory: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  itemIcon: {
    borderRadius: 0,
    borderWidth: 0,
  },
  list: {
    flex: 1,
    marginHorizontal: 16,
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
  settingsButton: {
    height: 24,
    width: 24,
  },
});

export default WalletScreen;
