import {
  BackButton,
  NavigationHeader,
  SearchBar,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HistorySectionList } from '../../components/history/history-list';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

export const CredentialHistoryScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const insets = useSafeAreaInsets();
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'History'>>();
  const route = useRoute<CredentialDetailRouteProp<'History'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);

  const [searchPhrase, setSearchPhrase] = useState('');
  const query = useMemo(
    () => ({
      credentialId,
      entityTypes: [
        HistoryEntityTypeEnum.CREDENTIAL,
        HistoryEntityTypeEnum.PROOF,
      ],
      searchText: searchPhrase,
    }),
    [credentialId, searchPhrase],
  );

  const handleProofPress = useCallback(
    (entry: HistoryListItem) => {
      rootNavigation.navigate('Settings', {
        params: {
          params: { entry },
          screen: 'Detail',
        },
        screen: 'History',
      });
    },
    [rootNavigation],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme.background,
          paddingTop: insets.top,
        },
      ]}
      testID="CredentialHistoryScreen"
    >
      <NavigationHeader
        leftItem={<BackButton onPress={navigation.goBack} />}
        title={credential?.schema.name}
      />
      <SearchBar
        onSearchPhraseChange={setSearchPhrase}
        placeholder={translate('common.search')}
        searchPhrase={searchPhrase}
        style={styles.search}
        testID="CredentialHistoryScreen.search"
      />
      <HistorySectionList
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        getItemProps={(item) =>
          item.entityType === HistoryEntityTypeEnum.PROOF ||
          item.entityType === HistoryEntityTypeEnum.CREDENTIAL
            ? { onPress: handleProofPress }
            : undefined
        }
        query={query}
        testID="CredentialHistoryScreen.list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  search: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
});
