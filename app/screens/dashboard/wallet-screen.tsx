import {
  ActivityIndicator,
  concatTestID,
  FlatListView,
  formatDateTime,
  Header,
  TextAvatar,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { CredentialStateEnum } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
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

  const { data: credentialsData, fetchNextPage } = usePagedCredentials();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();

  const credentials = useMemo(
    () => credentialsData?.pages.flat(),
    [credentialsData?.pages],
  );

  const handleEndReached = useCallback(() => {
    const pageParam = credentialsData?.pages.length;
    if (!pageParam) {
      return;
    }
    fetchNextPage({ pageParam });
  }, [fetchNextPage, credentialsData?.pages.length]);

  const revocationCheckPerformed = useRef<boolean>(false);
  useEffect(() => {
    if (!revocationCheckPerformed.current && credentials?.length) {
      revocationCheckPerformed.current = true;
      checkRevocation(credentials.map(({ id }) => id)).catch((e) =>
        reportException(e, 'Revocation check failed'),
      );
    }
  }, [checkRevocation, credentials]);

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

  const containerStyle: ViewStyle = {
    marginBottom: Math.max(safeAreaInsets.bottom, 20) + 99,
  };

  return (
    <FlatListView
      contentContainerStyle={containerStyle}
      emptyListIcon={{
        component: credentials ? (
          <EmptyIcon color={colorScheme.lightGrey} />
        ) : (
          <ActivityIndicator />
        ),
      }}
      emptyListIconStyle={styles.emptyIcon}
      emptyListSubtitle={translate(
        'wallet.walletScreen.credentialsList.empty.subtitle',
      )}
      emptyListTitle={translate(
        'wallet.walletScreen.credentialsList.empty.title',
      )}
      items={
        credentials?.map((credential) => {
          const testID = concatTestID('WalletScreen.credential', credential.id);
          const revoked = credential.state === CredentialStateEnum.REVOKED;
          return {
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
            rightAccessory: <NextIcon color={colorScheme.text} />,
            style: [styles.listItem, { backgroundColor: colorScheme.white }],
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
        }) ?? []
      }
      key={locale}
      listHeader={
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
      listHeaderStyle={[styles.header, { paddingTop: safeAreaInsets.top }]}
      onEndReached={handleEndReached}
      onItemSelected={handleCredentialPress}
      staticContent={false}
      stickySectionHeadersEnabled={false}
      style={[
        styles.list,
        containerStyle,
        { backgroundColor: colorScheme.background },
      ]}
      title={translate(
        credentials?.length
          ? 'wallet.walletScreen.credentialsList.title'
          : 'wallet.walletScreen.credentialsList.title.empty',
        { credentialsCount: credentials?.length },
      )}
      titleStyle={[styles.title, { backgroundColor: colorScheme.white }]}
    />
  );
});

const styles = StyleSheet.create({
  emptyIcon: {
    marginBottom: 2,
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 0,
    marginTop: -20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    borderRadius: 20,
    marginBottom: 0,
    overflow: 'hidden',
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});

export default WalletScreen;
