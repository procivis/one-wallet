import {
  ActivityIndicator,
  FoldableHeader,
  GhostButton,
  Header,
  ScanButton,
  StatusErrorIcon,
  StatusWarningIcon,
  useAppColorScheme,
  usePagedCredentials,
  useWalletUnitCheck,
  WalletEmptyList,
} from '@procivis/one-react-native-components';
import {
  CredentialListIncludeEntityType,
  CredentialListQuery,
  CredentialStateEnum,
  SortableCredentialColumnEnum,
  WalletUnitStatusEnum,
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
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RefreshIcon } from '../../components/icon/refresh-icon';
import {
  HeaderOptionsButton,
  HeaderPlusButton,
} from '../../components/navigation/header-buttons';
import WalletCredentialList from '../../components/wallet/credential-list';
import WalletNotice, {
  WalletNoticeProps,
} from '../../components/wallet/wallet-notice';
import { assets, config } from '../../config';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { isWalletAttestationExpired } from '../../utils/wallet-unit';

const WalletScreen: FunctionComponent = observer(() => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const { credentialIssuers = [] } = assets;

  const [scrollOffset] = useState(() => new Animated.Value(0));

  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Partial<CredentialListQuery>>({
    include: [CredentialListIncludeEntityType.LAYOUT_PROPERTIES],
    sort: SortableCredentialColumnEnum.SCHEMA_NAME,
    states: [
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
  const showRequestCredentialBtn =
    config.featureFlags.requestCredentialEnabled &&
    credentialIssuers.length > 0 &&
    credentialIssuers.filter((issuer) => issuer.enabled).length > 0;

  useCredentialStatusCheck();
  const { isLoading: isLoadingWUA, walletUnitAttestation } = useWalletUnitCheck(
    config.walletProvider.appIntegrityCheckRequired,
  );

  useEffect(() => {
    if (!isFocused || !config.walletProvider.required) {
      return;
    }
    if (
      walletUnitAttestation?.status === WalletUnitStatusEnum.REVOKED ||
      isWalletAttestationExpired(walletUnitAttestation)
    ) {
      navigation.navigate('WalletUnitError');
    }
  }, [isFocused, walletUnitAttestation, navigation]);

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

  const handleRequestCredentialClick = useCallback(() => {
    navigation.navigate('RequestCredentialList');
  }, [navigation]);

  const handleRefreshWalletUnit = useCallback(() => {
    navigation.navigate('WalletUnitAttestation', { refresh: true });
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

  const rightButtons = useMemo(
    () => [
      ...(showRequestCredentialBtn
        ? [
            <HeaderPlusButton
              key="plus"
              onPress={handleRequestCredentialClick}
              testID="WalletScreen.header.action-issue-document"
            />,
          ]
        : []),

      <HeaderOptionsButton
        accessibilityLabel="common.settings"
        key="options"
        onPress={handleWalletSettingsClick}
        testID="WalletScreen.header.action-settings"
      />,
    ],
    [
      handleRequestCredentialClick,
      handleWalletSettingsClick,
      showRequestCredentialBtn,
    ],
  );

  const topNotice: WalletNoticeProps | undefined = useMemo(() => {
    if (config.walletProvider.required) {
      return;
    }
    if (walletUnitAttestation?.status === WalletUnitStatusEnum.REVOKED) {
      return {
        icon: StatusErrorIcon,
        text: 'Wallet attestation is revoked',
      };
    } else if (isWalletAttestationExpired(walletUnitAttestation)) {
      return {
        accessory: (
          <GhostButton
            accessibilityLabel={translate(
              'info.accessibility.walletUnitAttestation.refresh',
            )}
            icon={RefreshIcon}
            onPress={handleRefreshWalletUnit}
            style={styles.noticeWarning}
          />
        ),
        icon: StatusWarningIcon,
        text: 'Wallet attestation is expired',
      };
    }
  }, [walletUnitAttestation, handleRefreshWalletUnit]);
  const walletAttestationNoticeOffset: ViewStyle | undefined = topNotice
    ? {
        marginTop: safeAreaInsets.top + 40,
      }
    : undefined;

  return (
    <View
      style={[
        styles.noticeBackground,
        { backgroundColor: topNotice ? colorScheme.black : undefined },
      ]}
      testID="WalletScreen"
    >
      {topNotice && (
        <WalletNotice
          {...topNotice}
          style={[
            styles.notice,
            { marginTop: safeAreaInsets.top },
            topNotice.style,
          ]}
        />
      )}
      <View
        style={[
          styles.background,
          walletAttestationNoticeOffset,
          { backgroundColor: colorScheme.background },
        ]}
        testID="WalletScreen"
      >
        {(!credentials || isLoadingWUA) && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator animate={isFocused} />
          </View>
        )}
        {credentials && isEmpty && (
          <WalletEmptyList
            onScanPress={handleScanPress}
            scanButtonTitle={translate('common.scanQrCode')}
            subtitle={translate('info.wallet.credentialsList.empty.subtitle')}
            testID="WalletScreen.empty"
            title={translate('common.noCredentialsYet')}
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
            withNotice={Boolean(topNotice)}
          />
        )}
        {!isEmpty && (
          <ScanButton onPress={handleScanPress} testID="WalletScreen.scan" />
        )}
        <FoldableHeader
          header={
            <Header
              rightButtons={rightButtons}
              testID={'WalletScreen.header'}
              title={translate('common.wallet')}
              titleRowStyle={!isEmpty && styles.headerWithSearchBar}
            />
          }
          scrollOffset={scrollOffset}
          searchBar={
            isEmpty
              ? undefined
              : {
                  rightButtons,
                  searchBarProps: {
                    onSearchPhraseChange: setSearchPhrase,
                    placeholder: translate('common.search'),
                    searchPhrase,
                    testID: 'WalletScreen.header.search',
                  },
                }
          }
          withNotice={Boolean(topNotice)}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    overflow: 'hidden',
  },
  headerWithSearchBar: {
    marginTop: 0,
    paddingBottom: 18,
  },
  loadingIndicator: {
    height: '100%',
  },
  notice: {
    marginBottom: 12,
    paddingTop: 4,
    position: 'absolute',
    width: '100%',
  },
  noticeBackground: {
    flex: 1,
  },
  noticeWarning: {
    marginLeft: 19,
  },
});

export default WalletScreen;
