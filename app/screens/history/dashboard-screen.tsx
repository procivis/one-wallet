import {
  ActionModal,
  Button,
  concatTestID,
  DetailScreen,
  FilterButton,
  ListItemProps,
  RadioGroup,
  RadioGroupItem,
  SearchBar,
  SectionListView,
  useAppColorScheme,
} from '@procivis/react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListQuery,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NextIcon } from '../../components/icon/common-icon';
import { useCredentialSchemas } from '../../hooks/core/credential-schemas';
import { useHistory } from '../../hooks/core/history';
import { translate } from '../../i18n';
import { HistoryNavigationProp } from '../../navigators/history/history-routes';
import { formatMonth, formatTimestamp } from '../../utils/date';
import { getEntryTitle, groupEntriesByMonth } from '../../utils/history';

const DashboardScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<HistoryNavigationProp<'Dashboard'>>();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [isFilterModalOpened, setIsFilterModalOpened] =
    useState<boolean>(false);
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Partial<HistoryListQuery>>({
    entityTypes: [
      HistoryEntityTypeEnum.BACKUP,
      HistoryEntityTypeEnum.CREDENTIAL,
      HistoryEntityTypeEnum.PROOF,
    ],
  });
  const {
    data: credentialSchemas,
    fetchNextPage: fetchNextSchemasPage,
    hasNextPage: hasNextSchemasPage,
  } = useCredentialSchemas();
  const {
    data: historyData,
    fetchNextPage: fetchNextHistoryPage,
    hasNextPage: hasNextHistoryPage,
  } = useHistory(queryParams);

  const history = useMemo(() => {
    const items = historyData?.pages
      .flat()
      .map((page) => page.values)
      .flat();
    if (!items) {
      return undefined;
    }
    return groupEntriesByMonth(items);
  }, [historyData?.pages]);

  const sections = useMemo(() => {
    return history?.map((section) => {
      const data: ListItemProps[] = section.entries.map((entry, index) => ({
        rightAccessory: <NextIcon color={colorScheme.text} />,
        style: styles.entry,
        subtitle: (() => {
          const createdDate = formatTimestamp(new Date(entry.createdDate));
          if (entry.did) {
            return `${createdDate} - ${entry.did}`;
          }
          return createdDate;
        })(),
        subtitleStyle: {
          ellipsizeMode: 'middle',
        },
        testID: concatTestID('HistoryScreen.history', index.toString()),
        title: getEntryTitle(entry),
      }));
      return {
        data,
        title: formatMonth(new Date(section.date)),
        titleStyle: styles.entryListTitle,
      };
    });
  }, [colorScheme.text, history]);

  const handleHistoryEndReached = useCallback(() => {
    const pageParam = historyData?.pages.length;
    if (!pageParam) {
      return;
    }
    fetchNextHistoryPage({ pageParam });
  }, [fetchNextHistoryPage, historyData?.pages.length]);

  const handleSchemasEndReached = useCallback(() => {
    const pageParam = credentialSchemas?.pages.length;
    if (!pageParam) {
      return;
    }
    fetchNextSchemasPage({ pageParam });
  }, [fetchNextSchemasPage, credentialSchemas?.pages?.length]);

  const handleItemPress = useCallback(
    (_: ListItemProps, entryGroupIndex: number, index: number) => {
      navigation.navigate('Detail', {
        entry: history![entryGroupIndex].entries[index],
      });
    },
    [history, navigation],
  );

  const handleCredentialSchemaChange = useCallback(
    (item: RadioGroupItem) => {
      const credentialSchemaId = `${item.key}` || undefined;
      setQueryParams({ ...queryParams, credentialSchemaId });
    },
    [queryParams],
  );

  const handleSearchPhraseChange = debounce(setQueryParams, 500);

  useEffect(
    () => {
      handleSearchPhraseChange({
        ...queryParams,
        searchText: searchPhrase || undefined,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchPhrase],
  );

  if (!history || !credentialSchemas) {
    return <ActivityIndicator />;
  }

  const header =
    sections || queryParams.searchText || queryParams.credentialSchemaId ? (
      <View style={styles.actions}>
        <SearchBar
          onSearchPhraseChange={setSearchPhrase}
          placeholder={translate('common.search')}
          searchPhrase={searchPhrase}
          style={styles.searchBar}
          testID="HistoryScreen.search"
        />

        <FilterButton
          enabled={isFilterModalOpened || !!queryParams.credentialSchemaId}
          onPress={() => setIsFilterModalOpened(true)}
          testID="HistoryScreen.filter"
        />
      </View>
    ) : undefined;

  return (
    <>
      <DetailScreen
        onBack={navigation.goBack}
        staticContent={true}
        style={[styles.container, { backgroundColor: colorScheme.background }]}
        testID="HistoryScreen"
        title={translate('history.title')}
      >
        <SectionListView
          contentContainerStyle={{ paddingBottom: bottomInset }}
          emptyListView={{
            subtitle: translate('history.empty.subtitle'),
            title: translate('history.empty.title'),
          }}
          listFooter={
            hasNextHistoryPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colorScheme.accent} />
              </View>
            ) : undefined
          }
          listHeader={header}
          onEndReached={handleHistoryEndReached}
          onItemSelected={handleItemPress}
          sections={sections ?? []}
          style={styles.entryList}
          testID="HistoryScreen.list"
        />
      </DetailScreen>

      <ActionModal
        contentStyle={[
          styles.filterModalContent,
          { paddingBottom: bottomInset },
        ]}
        visible={isFilterModalOpened}
      >
        <RadioGroup
          items={[
            {
              key: '',
              label: translate('common.all'),
              style: styles.filterGroupItem,
            },
            ...credentialSchemas.pages.flat().map((credentialSchema) => ({
              key: credentialSchema.id,
              label: credentialSchema.name,
              style: styles.filterGroupItem,
            })),
          ]}
          listFooter={
            hasNextSchemasPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colorScheme.accent} />
              </View>
            ) : undefined
          }
          onDeselected={handleCredentialSchemaChange}
          onEndReached={handleSchemasEndReached}
          onSelected={handleCredentialSchemaChange}
          selectedItems={
            queryParams.credentialSchemaId
              ? [queryParams.credentialSchemaId]
              : ['']
          }
          staticContent={false}
          style={styles.filterGroup}
          title={translate('history.filter.title')}
        />
        <Button
          onPress={() => setIsFilterModalOpened(false)}
          testID="HistoryScreen.filter.close"
          type="light"
        >
          {translate('common.close')}
        </Button>
      </ActionModal>
    </>
  );
};

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginHorizontal: 24,
    marginTop: 8,
  },
  container: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  entry: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  // eslint-disable-next-line react-native/no-color-literals
  entryList: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  entryListTitle: {
    marginBottom: 18,
    marginLeft: 24,
    marginTop: 4,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterGroupItem: {
    marginVertical: 0,
    paddingTop: 8,
  },
  filterModalContent: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: '85%',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  footer: {
    paddingVertical: 20,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
  },
});

export default DashboardScreen;
