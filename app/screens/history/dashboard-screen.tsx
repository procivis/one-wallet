import {
  BackButton,
  NavigationHeader,
  SearchBar,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
  HistoryListQuery,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CredentialSchemaPicker } from '../../components/history/credential-schema-picker';
import { FilterButton } from '../../components/history/filter-button';
import { HistorySectionList } from '../../components/history/history-list';
import { translate } from '../../i18n';
import { HistoryNavigationProp } from '../../navigators/history/history-routes';

const HistoryDashboardScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HistoryNavigationProp<'Dashboard'>>();
  const [isFilterModalOpened, setIsFilterModalOpened] =
    useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<Partial<HistoryListQuery>>({
    entityTypes: [
      HistoryEntityTypeEnum.BACKUP,
      HistoryEntityTypeEnum.CREDENTIAL,
      HistoryEntityTypeEnum.PROOF,
    ],
  });

  const handleItemPress = useCallback(
    (entry: HistoryListItem) => {
      navigation.navigate('Detail', { entry });
    },
    [navigation],
  );

  const handleCredentialSchemaChange = useCallback(
    (credentialSchemaId?: string) => {
      setQueryParams((prev) => ({ ...prev, credentialSchemaId }));
    },
    [],
  );

  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const handleSearchPhraseChange = useMemo(
    () =>
      debounce(
        (newSearchPhrase: string | undefined) =>
          setQueryParams((prev) => ({ ...prev, searchText: newSearchPhrase })),
        500,
      ),
    [],
  );
  useEffect(() => {
    handleSearchPhraseChange(searchPhrase || undefined);
  }, [searchPhrase, handleSearchPhraseChange]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme.background,
          paddingTop: insets.top,
        },
      ]}
      testID="HistoryScreen"
    >
      <NavigationHeader
        leftItem={<BackButton onPress={navigation.goBack} />}
        title={translate('history.title')}
      />
      <View style={styles.searchLine}>
        <SearchBar
          onSearchPhraseChange={setSearchPhrase}
          placeholder={translate('common.search')}
          searchPhrase={searchPhrase}
          style={styles.searchBar}
          testID="HistoryScreen.search"
        />
        <FilterButton
          active={Boolean(queryParams.credentialSchemaId)}
          onPress={() => setIsFilterModalOpened(true)}
          testID="HistoryScreen.filter"
        />
      </View>
      <HistorySectionList
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        itemProps={{ onPress: handleItemPress }}
        query={queryParams}
      />
      <CredentialSchemaPicker
        onClose={() => setIsFilterModalOpened(false)}
        onSelection={handleCredentialSchemaChange}
        selected={queryParams.credentialSchemaId}
        visible={isFilterModalOpened}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flex: 1,
    marginRight: 4,
  },
  searchLine: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
});

export default HistoryDashboardScreen;
