import {
  ActivityIndicator,
  FoldableHeader,
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
  CredentialListIncludeEntityTypeBindingEnum,
  CredentialListQueryBindingDto,
  CredentialStateBindingEnum,
  SortableCredentialColumnBindingEnum,
  WalletUnitStatusBindingEnum,
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
import useVersionCheck from '../../hooks/version-check/version-check';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { saveString, useLoadString } from '../../utils/storage';

const ignoredVersionNotchVersionStorageKey = 'ignoredVersionNotchVersion';

const WalletScreen: FunctionComponent = observer(() => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const {
    walletStore: { walletProvider, registeredWalletUnitId },
  } = useStores();
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const { credentialIssuers = [] } = assets;
  const { isBelowRecommendedVersion, appVersion } = useVersionCheck();
  const [isNotchClosed, setIsNotchClosed] = useState(false);

  const [scrollOffset] = useState(() => new Animated.Value(0));
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const [queryParams, setQueryParams] = useState<
    Partial<CredentialListQueryBindingDto>
  >({
    include: [CredentialListIncludeEntityTypeBindingEnum.LAYOUT_PROPERTIES],
    sort: SortableCredentialColumnBindingEnum.SCHEMA_NAME,
    states: [
      CredentialStateBindingEnum.ACCEPTED,
      CredentialStateBindingEnum.SUSPENDED,
      CredentialStateBindingEnum.REVOKED,
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

  const {
    value: ignoredNotchVersion,
    isLoading: isIgnoredNotchVersionLoading,
  } = useLoadString(ignoredVersionNotchVersionStorageKey);

  const isNotchNotIgnored = useMemo(
    () => !isIgnoredNotchVersionLoading && appVersion !== ignoredNotchVersion,
    [ignoredNotchVersion, isIgnoredNotchVersionLoading, appVersion],
  );

  const showUpdateNotch = useMemo(
    () => !isNotchClosed && isBelowRecommendedVersion && isNotchNotIgnored,
    [isNotchNotIgnored, isBelowRecommendedVersion, isNotchClosed],
  );

  useCredentialStatusCheck();
  const { isLoading: isLoadingWU, walletUnitDetail } = useWalletUnitCheck(
    registeredWalletUnitId,
  );

  useEffect(() => {
    if (!isFocused || !walletProvider.walletUnitAttestation.required) {
      return;
    }

    if (walletUnitDetail?.status === WalletUnitStatusBindingEnum.REVOKED) {
      navigation.navigate('WalletUnitError');
    }
  }, [
    isFocused,
    navigation,
    walletProvider.walletUnitAttestation.required,
    walletUnitDetail?.status,
  ]);

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
        navigation.navigate('CredentialDetailBindingDto', {
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

  const handleUpdateNoticeClose = useCallback(() => {
    saveString(ignoredVersionNotchVersionStorageKey, appVersion);
    setIsNotchClosed(true);
  }, [appVersion]);

  const topNotice: WalletNoticeProps | undefined = useMemo(() => {
    if (walletProvider.walletUnitAttestation.required) {
      return;
    }
    if (showUpdateNotch) {
      return {
        icon: StatusWarningIcon,
        onClose: handleUpdateNoticeClose,
        text: translate('common.updateAvailable'),
      };
    }
    if (walletUnitDetail?.status === WalletUnitStatusBindingEnum.REVOKED) {
      return {
        icon: StatusErrorIcon,
        text: 'Wallet unit is revoked',
      };
    }
  }, [
    walletProvider.walletUnitAttestation.required,
    showUpdateNotch,
    walletUnitDetail?.status,
    handleUpdateNoticeClose,
  ]);
  const noticeOffset: ViewStyle | undefined = topNotice
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
          noticeOffset,
          { backgroundColor: colorScheme.background },
        ]}
        testID="WalletScreen"
      >
        {(!credentials || isLoadingWU) && (
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
