import {
  BackButton,
  NavigationHeader,
  SearchBar,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { HistoryEntityTypeEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HistoryItem from '../../components/history/history-item';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useHistory } from '../../hooks/core/history';
import { translate } from '../../i18n';
import { HistoryListItemWithDid } from '../../models/core/history';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import {
  groupEntriesByDay,
  HistoryGroupByDaySection,
} from '../../utils/history';

export const CredentialHistoryScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CredentialDetailNavigationProp<'History'>>();
  const route = useRoute<CredentialDetailRouteProp<'History'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);

  const [searchPhrase, setSearchPhrase] = useState('');

  const {
    data: historyData,
    fetchNextPage: fetchNextHistoryPage,
    hasNextPage: hasNextHistoryPage,
  } = useHistory({
    credentialId,
    entityTypes: [
      HistoryEntityTypeEnum.CREDENTIAL,
      HistoryEntityTypeEnum.PROOF,
    ],
    searchText: searchPhrase,
  });

  const history = useMemo(() => {
    const items = historyData?.pages
      .flat()
      .map((page) => page.values)
      .flat();
    if (!items) {
      return undefined;
    }
    return groupEntriesByDay(items);
  }, [historyData?.pages]);

  const onEndReached = useCallback(() => {
    if (hasNextHistoryPage) {
      fetchNextHistoryPage();
    }
  }, [fetchNextHistoryPage, hasNextHistoryPage]);

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
      />
      {history && (
        <SectionList<HistoryListItemWithDid, HistoryGroupByDaySection>
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 24 + insets.bottom },
          ]}
          keyExtractor={(item) => item.id}
          onEndReached={onEndReached}
          renderItem={({ item, index, section }) => (
            <Item
              entry={item}
              first={!index}
              last={index === section.data.length - 1}
            />
          )}
          renderSectionHeader={({ section }) => (
            <SectionHeader section={section} />
          )}
          sections={history}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

const SectionHeader: FC<{
  section: HistoryGroupByDaySection;
}> = ({ section }) => {
  const colorScheme = useAppColorScheme();
  const now = moment();
  const date = moment(section.date);

  let day = date.format('Do MMMM');
  if (date.isSame(now, 'day')) {
    day = translate('common.today');
  } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
    day = translate('common.yesterday');
  }

  return (
    <View style={styles.sectionHeader}>
      <Typography
        accessibilityRole="header"
        color={colorScheme.text}
        preset="m"
      >
        {day}
      </Typography>
      {section.firstYearEntry && (
        <Typography
          color={colorScheme.accent}
          preset="s/line-height-small"
          style={styles.year}
        >
          {section.date.year()}
        </Typography>
      )}
    </View>
  );
};

const Item: FC<{
  entry: HistoryListItemWithDid;
  first?: boolean;
  last?: boolean;
}> = ({ entry, first, last }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[
        styles.item,
        first && styles.first,
        last && styles.last,
        { backgroundColor: colorScheme.white },
      ]}
    >
      <HistoryItem absoluteTime={true} historyItem={entry} last={last} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  first: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 8,
    paddingTop: 12,
  },
  item: {
    paddingHorizontal: 12,
  },
  last: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  search: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  year: {
    opacity: 0.7,
  },
});
