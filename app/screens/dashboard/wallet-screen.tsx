import {
  ActivityIndicator,
  concatTestID,
  EmptyListView,
  formatDateTime,
  Header,
  ListItem,
  ListItemProps,
  ListSectionHeader,
  TextAvatar,
  useAppColorScheme,
} from '@procivis/react-native-components';
import {
  CredentialListItem,
  CredentialStateEnum,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  ActivityIndicator as LoadingIndicator,
  SectionList,
  SectionListProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NextIcon } from '../../components/icon/common-icon';
import { EmptyIcon, SettingsIcon } from '../../components/icon/wallet-icon';
import {
  useCredentialRevocationCheck,
  usePagedCredentials,
} from '../../hooks/credentials';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const safeAreaInsets = useSafeAreaInsets();

  const {
    locale: { locale },
  } = useStores();

  const {
    data: credentialsData,
    fetchNextPage,
    hasNextPage,
  } = usePagedCredentials();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();

  const credentials = useMemo(
    () =>
      credentialsData?.pages
        .map((page) => page.values)
        .flat()
        .filter(
          ({ state }) =>
            state === CredentialStateEnum.ACCEPTED ||
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
          .filter(({ state }) => state === CredentialStateEnum.ACCEPTED)
          .map(({ id }) => id),
      ).catch((e) => reportException(e, 'Revocation check failed'));
    }
  }, [checkRevocation, credentialsData]);

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleCredentialPress = useCallback(
    (_, index: number) => {
      const credentialId = credentials?.[index]?.id;
      if (credentialId) {
        navigation.navigate('CredentialDetail', { credentialId });
      }
    },
    [credentials, navigation],
  );

  const renderTitle: SectionListProps<CredentialListItem>['renderSectionHeader'] =
    useCallback(
      () => (
        <View
          style={[styles.titleWrapper, { backgroundColor: colorScheme.white }]}
        >
          <ListSectionHeader
            title={translate('wallet.walletScreen.credentialsList.title', {
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
          subtitle: revoked
            ? translate('credentialDetail.log.revoke')
            : formatDateTime(new Date(credential.issuanceDate)),
          subtitleStyle: revoked
            ? {
                color: colorScheme.alertText,
                testID: concatTestID(testID, 'revoked'),
              }
            : undefined,
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
        colorScheme.alertText,
        colorScheme.text,
        colorScheme.white,
        handleCredentialPress,
      ],
    );

  const containerStyle: ViewStyle = {
    flex: !credentials ? 1 : undefined,
    marginBottom: Math.max(safeAreaInsets.bottom, 20) + 99,
  };

  return (
    <View
      style={[styles.background, { backgroundColor: colorScheme.background }]}
    >
      <SectionList
        ListEmptyComponent={
          credentials ? (
            <View
              style={[styles.empty, { backgroundColor: colorScheme.white }]}
            >
              <ListSectionHeader
                title={translate(
                  'wallet.walletScreen.credentialsList.title.empty',
                )}
                titleStyle={styles.title}
              />
              <EmptyListView
                icon={{
                  component: <EmptyIcon color={colorScheme.lightGrey} />,
                }}
                iconStyle={styles.emptyIcon}
                subtitle={translate(
                  'wallet.walletScreen.credentialsList.empty.subtitle',
                )}
                title={translate(
                  'wallet.walletScreen.credentialsList.empty.title',
                )}
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
              style={[styles.footer, { backgroundColor: colorScheme.white }]}
            >
              {hasNextPage ? (
                <LoadingIndicator
                  color={colorScheme.accent}
                  style={styles.pageLoadingIndicator}
                />
              ) : undefined}
            </View>
          ) : undefined
        }
        ListHeaderComponent={
          <Header
            actionButtons={[
              {
                accessibilityLabel: translate('wallet.settings.title'),
                content: SettingsIcon,
                key: 'settings',
                onPress: handleWalletSettingsClick,
              },
            ]}
            testID={'WalletScreen.header'}
            title={translate('wallet.walletScreen.title')}
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
