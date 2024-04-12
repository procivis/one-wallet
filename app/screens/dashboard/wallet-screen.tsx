import {
  CredentialCard,
  Header,
  OptionsIcon,
  ScanButton,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  ActivityIndicator,
  concatTestID,
  EmptyListView,
  ListSectionHeader,
  TouchableOpacity,
  useAppColorScheme as useAppColorScheme__OLD,
} from '@procivis/react-native-components';
import {
  CredentialListIncludeEntityType,
  CredentialListItem,
  CredentialListQuery,
  CredentialStateEnum,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
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
  SectionList,
  SectionListRenderItemInfo,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyIcon } from '../../components/icon/wallet-icon';
import { usePagedCredentials } from '../../hooks/core/credentials';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { getCredentialCardPropsFromCredential } from '../../utils/credential';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme__OLD = useAppColorScheme__OLD();
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const safeAreaInsets = useSafeAreaInsets();
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
      const credential = item;
      const testID = concatTestID('WalletScreen.credential', credential.id);
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleCredentialPress(credential.id)}
          style={[
            styles.listItem,
            index === section.data.length - 1 ? styles.listItemLast : undefined,
          ]}
        >
          <CredentialCard
            {...getCredentialCardPropsFromCredential(
              credential,
              undefined,
              testID,
            )}
          />
        </TouchableOpacity>
      );
    },
    [handleCredentialPress],
  );

  const containerStyle: ViewStyle = {
    flex: !credentials ? 1 : undefined,
  };

  return (
    <View
      style={[styles.background, { backgroundColor: colorScheme.background }]}
      testID="WalletScreen"
    >
      <SectionList
        ListEmptyComponent={
          credentials ? (
            <View
              style={[
                styles.empty,
                { backgroundColor: colorScheme__OLD.white },
              ]}
              testID="WalletScreen.credentialList"
            >
              <ListSectionHeader
                title={translate('wallet.credentialsList.title.empty')}
                titleStyle={styles.title}
              />
              <EmptyListView
                icon={{
                  component: <EmptyIcon color={colorScheme__OLD.lightGrey} />,
                }}
                iconStyle={styles.emptyIcon}
                subtitle={translate('wallet.credentialsList.empty.subtitle')}
                title={translate('wallet.credentialsList.empty.title')}
              />
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
                  color={colorScheme__OLD.accent}
                  style={styles.pageLoadingIndicator}
                />
              )}
            </View>
          ) : undefined
        }
        ListHeaderComponent={
          <Header
            onSearchPhraseChange={setSearchPhrase}
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
            testID={'WalletScreen.header'}
            text={{
              searchPlaceholder: translate('wallet.search'),
            }}
            title={translate('wallet.title')}
          />
        }
        ListHeaderComponentStyle={[
          styles.header,
          { paddingTop: safeAreaInsets.top },
        ]}
        contentContainerStyle={containerStyle}
        key={locale}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        renderItem={renderItem}
        sections={
          credentials && credentials.length > 0 ? [{ data: credentials }] : []
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        style={[
          styles.list,
          containerStyle,
          { backgroundColor: colorScheme.background },
        ]}
      />
      <ScanButton onPress={handleScanPress} />
    </View>
  );
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  empty: {
    borderRadius: 20,
  },
  emptyIcon: {
    marginBottom: 2,
  },
  footer: {
    minHeight: 20,
  },
  header: {
    marginHorizontal: -16,
  },
  itemIcon: {
    borderRadius: 0,
    borderWidth: 0,
  },
  list: {
    flex: 1,
    marginHorizontal: 16,
    overflow: 'visible',
    paddingHorizontal: 0,
  },
  listItem: {
    height: 60,
    marginBottom: 8,
  },
  listItemLast: {
    height: 'auto',
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
  title: {
    borderRadius: 20,
    marginBottom: 0,
    paddingBottom: 4,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  titleWrapper: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default WalletScreen;
