import {
  formatDateTime,
  Header,
  OptionsIcon,
  ScanButton,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  ActivityIndicator,
  concatTestID,
  EmptyListView,
  ListItem,
  ListItemProps,
  ListSectionHeader,
  TextAvatar,
  useAppColorScheme as useAppColorScheme__OLD,
} from '@procivis/react-native-components';
import {
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
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator as LoadingIndicator,
  SectionList,
  SectionListProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NextIcon } from '../../components/icon/common-icon';
import { EmptyIcon } from '../../components/icon/wallet-icon';
import {
  useCredentialRevocationCheck,
  usePagedCredentials,
} from '../../hooks/credentials';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme__OLD = useAppColorScheme__OLD();
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const safeAreaInsets = useSafeAreaInsets();
  const {
    locale: { locale },
  } = useStores();
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Partial<CredentialListQuery>>(
    {},
  );
  const {
    data: credentialsData,
    fetchNextPage,
    hasNextPage,
  } = usePagedCredentials(queryParams);
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();

  const credentials = useMemo(
    () =>
      credentialsData?.pages
        .map((page) => page.values)
        .flat()
        .filter(
          ({ state }) =>
            state === CredentialStateEnum.ACCEPTED ||
            state === CredentialStateEnum.SUSPENDED ||
            state === CredentialStateEnum.REVOKED,
        ),
    [credentialsData?.pages],
  );

  const handleEndReached = useCallback(() => {
    const pageParam = credentialsData?.pages.length;
    if (!pageParam) {
      return;
    }
    fetchNextPage({ pageParam });
  }, [fetchNextPage, credentialsData?.pages.length]);

  const revocationCheckPerformedForPage = useRef<number>();

  useEffect(() => {
    if (!credentialsData) {
      return;
    }
    const page = credentialsData.pages.length - 1;
    if (revocationCheckPerformedForPage.current !== page) {
      revocationCheckPerformedForPage.current = page;
      checkRevocation(
        credentialsData.pages[page].values
          .filter(({ state }) =>
            [
              CredentialStateEnum.ACCEPTED,
              CredentialStateEnum.SUSPENDED,
            ].includes(state),
          )
          .map(({ id }) => id),
      ).catch((e) => reportException(e, 'Revocation check failed'));
    }
  }, [checkRevocation, credentialsData]);

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleSearchPhraseChange = debounce(setQueryParams, 500);

  useEffect(
    () => {
      handleSearchPhraseChange({
        ...queryParams,
        name: searchPhrase || undefined,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchPhrase],
  );

  const handleCredentialPress = useCallback(
    (_, index: number) => {
      const credentialId = credentials?.[index]?.id;
      if (credentialId) {
        navigation.navigate('CredentialDetail', {
          params: { credentialId },
          screen: 'Detail',
        });
      }
    },
    [credentials, navigation],
  );

  const handleScanPress = useCallback(() => {
    navigation.navigate('Dashboard', { screen: 'QRCodeScanner' });
  }, [navigation]);

  const renderTitle: SectionListProps<CredentialListItem>['renderSectionHeader'] =
    useCallback(
      () => (
        <View
          style={[styles.titleWrapper, { backgroundColor: colorScheme.white }]}
        >
          <ListSectionHeader
            title={translate('wallet.credentialsList.title', {
              credentialsCount: credentials?.length,
            })}
            titleStyle={styles.title}
          />
        </View>
      ),
      [colorScheme.white, credentials?.length],
    );

  const renderItem: SectionListProps<CredentialListItem>['renderItem'] =
    useCallback(
      ({ item, index }) => {
        const credential = item;
        const testID = concatTestID('WalletScreen.credential', credential.id);
        const suspended = credential.state === CredentialStateEnum.SUSPENDED;
        const revoked = credential.state === CredentialStateEnum.REVOKED;
        const listItemProps: ListItemProps = {
          icon: {
            component: (
              <TextAvatar
                innerSize={48}
                produceInitials={true}
                shape="rect"
                text={credential.schema.name}
              />
            ),
          },
          iconStyle: styles.itemIcon,
          onPress: () => handleCredentialPress(undefined, index),
          rightAccessory: <NextIcon color={colorScheme.text} />,
          style: styles.listItem,
          subtitle: (() => {
            if (suspended) {
              return translate('credentialDetail.log.suspended');
            }
            if (revoked) {
              return translate('credentialDetail.log.revoked');
            }
            return formatDateTime(new Date(credential.issuanceDate));
          })(),
          subtitleStyle: (() => {
            if (suspended) {
              return {
                color: colorScheme__OLD.alertText,
                testID: concatTestID(testID, 'suspended'),
              };
            }
            if (revoked) {
              return {
                color: colorScheme__OLD.alertText,
                testID: concatTestID(testID, 'revoked'),
              };
            }
            return undefined;
          })(),
          testID,
          title: credential.schema.name,
        };
        return (
          <View style={{ backgroundColor: colorScheme.white }}>
            <ListItem {...listItemProps} />
          </View>
        );
      },
      [
        colorScheme__OLD.alertText,
        colorScheme.text,
        colorScheme.white,
        handleCredentialPress,
      ],
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
            <View
              style={[
                styles.footer,
                { backgroundColor: colorScheme__OLD.white },
              ]}
            >
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
        renderSectionHeader={renderTitle}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    minHeight: 20,
  },
  header: {
    marginHorizontal: -24,
  },
  itemIcon: {
    borderRadius: 0,
    borderWidth: 0,
  },
  list: {
    flex: 1,
    marginHorizontal: 24,
    overflow: 'visible',
    paddingHorizontal: 0,
  },
  listItem: {
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 8,
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
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  titleWrapper: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default WalletScreen;
