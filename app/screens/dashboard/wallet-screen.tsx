import {
  ActivityIndicator,
  FoldableHeader,
  Header,
  ScanButton,
  useAppColorScheme,
  usePagedCredentials,
  WalletEmptyList,
} from '@procivis/one-react-native-components';
import {
  CredentialListIncludeEntityType,
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
import { Animated, StyleSheet, View } from 'react-native';

import { HeaderOptionsButton } from '../../components/navigation/header-buttons';
import WalletCredentialList from '../../components/wallet/credential-list';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const WalletScreen: FunctionComponent = observer(() => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();

  const [scrollOffset] = useState(() => new Animated.Value(0));

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
        <WalletEmptyList
          onScanPress={handleScanPress}
          scanButtonTitle={translate('wallet.credentialsList.empty.scanQrCode')}
          subtitle={translate('wallet.credentialsList.empty.subtitle')}
          testID="WalletScreen.empty"
          title={translate('wallet.credentialsList.empty.title')}
        />
      )}
      {credentials && !isEmpty && (
        <WalletCredentialList
          credentials={credentials}
          hasNextPage={Boolean(hasNextPage)}
          onCredentialPress={handleCredentialPress}
          onEndReached={handleEndReached}
          scrollOffset={scrollOffset}
          testID="WalletScreen"
        />
      )}
      {!isEmpty && (
        <ScanButton onPress={handleScanPress} testID="WalletScreen.scan" />
      )}
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
  headerWithSearchBar: {
    marginTop: 0,
    paddingBottom: 18,
  },
  loadingIndicator: {
    height: '100%',
  },
});

export default WalletScreen;
