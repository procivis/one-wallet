import { HistoryListScreen } from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
  HistoryListQuery,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';

import { CredentialSchemaPicker } from '../../components/history/credential-schema-picker';
import { translate } from '../../i18n';
import { HistoryNavigationProp } from '../../navigators/history/history-routes';
import { historyListItemLabels } from '../../utils/history';

const HistoryDashboardScreen: FC = () => {
  const navigation = useNavigation<HistoryNavigationProp<'HistoryDashboard'>>();
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

  const handleSearchPhraseChange = useCallback(
    (newSearchPhrase: string | undefined) =>
      setQueryParams((prev) => ({ ...prev, searchText: newSearchPhrase })),
    [],
  );

  return (
    <HistoryListScreen
      labels={{
        emptySubtitle: translate('history.empty.subtitle'),
        emptyTitle: translate('history.empty.title'),
        list: {
          item: historyListItemLabels(),
          sectionHeader: {
            today: translate('common.today'),
            yesterday: translate('common.yesterday'),
          },
        },
        search: translate('common.search'),
        title: translate('history.title'),
      }}
      onBackPressed={navigation.goBack}
      onHistoryItemPressed={handleItemPress}
      onOpenFilter={() => setIsFilterModalOpened(true)}
      onSearchPhraseChange={handleSearchPhraseChange}
      queryParams={queryParams}
    >
      <CredentialSchemaPicker
        onClose={() => setIsFilterModalOpened(false)}
        onSelection={handleCredentialSchemaChange}
        selected={queryParams.credentialSchemaId}
        visible={isFilterModalOpened}
      />
    </HistoryListScreen>
  );
};

export default HistoryDashboardScreen;
